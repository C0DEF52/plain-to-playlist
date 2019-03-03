const fs = require('fs');
const readline = require('readline');

function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

async function main() {
    const args = process.argv.slice(2);
    const listPath = args[0];

    var extPos = listPath.lastIndexOf('.');
    const xmlPath = ( extPos < 0 ? listPath : listPath.substr(0, extPos) ) + '.xml';

    const writer = fs.createWriteStream( xmlPath );

    writer.write(
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n' +
        '<plist version="1.0">\n' +
        '<dict>\n' +
        '\t<key>Tracks</key>\n' +
        '\t<dict>\n'
    );

    const reader = readline.createInterface({
        input: fs.createReadStream( listPath ),
        crlfDelay: Infinity,
        console: false
    });

    var lineIdx = 0;
    var i = 1;
    var title;
    var url;

    for await (const line of reader) {
        if (lineIdx++ % 2 == 0) {
            title = line;
            continue;
        }

        url = line;

        writer.write(
            '\t\t<key>' + (i) + '</key>\n' +
            '\t\t<dict>\n' +
            '\t\t\t<key>Track ID</key><integer>' + (i++) + '</integer>\n' +
            '\t\t\t<key>Name</key><string>' + escapeXml(title) + '</string>\n' +
            '\t\t\t<key>Track Type</key><string>URL</string>\n' +
            '\t\t\t<key>Location</key><string>' + escapeXml(url) + '</string>\n' +
            '\t\t</dict>\n'
        );
    }

    writer.write(
        '\t</dict>\n' +
        '\t<key>Playlists</key>\n' +
        '\t<array>\n' +
        '\t\t<dict>\n' +
        '\t\t\t<key>Name</key><string>BBC Radio</string>\n' +
        '\t\t\t<key>Playlist ID</key><integer>1</integer>\n' +
        '\t\t\t<key>All Items</key><true/>\n' +
        '\t\t\t<key>Playlist Items</key>\n' +
        '\t\t\t<array>\n');

    const tracksCount = i - 1;
    for (i = 1; i <= tracksCount; i++) {
        writer.write(
            '\t\t\t\t<dict>\n' +
            '\t\t\t\t\t<key>Track ID</key><integer>' + i + '</integer>\n' +
            '\t\t\t\t</dict>\n'
        );
    }

    writer.write(
        '\t\t\t</array>\n' +
        '\t\t</dict>\n' +
        '\t</array>\n' +
        '</dict>\n' +
        '</plist>\n'
    );

    /*reader.on('line', function(line){
        //console.log('LINE: ', line)
    })*/

    console.log('List path: ', listPath);
}

main();
