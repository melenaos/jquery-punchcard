## Punchcard
[![jquery-punchcard](https://img.shields.io/bower/v/jquery-punchcard.svg?style=flat-square)](https://github.com/melenaos/jquery-punchcard/releases)

*A jquery plugin for creating GitHub Punchcard like graphs*

http://melenaos.github.io/jquery-punchcard/


## Installation

Include the script and stylesheet in the page:

```html
<link rel="stylesheet" href="punchcard.min.css" />

<!-- Dependencies -->
<script src="jquery.min.js"></script>
<script src="moment.min.js"></script>
<script src="moment-timezone-with-data.min.js"></script>
            
<script src="punchcard.min.js" async></script>
```

This plugin is also registered under http://bower.io/ to simplify integration. Try:
```
npm install -g bower
bower install jquery-punchcard
```

## Usage

Setting up a punchcard is fairly easy. The following snippet creates one:
```html
<div id="punchcardExample"></div>
<script>
    $(document).ready(function () {
        $('#punchcardExample').punchcard({
            data: [
                [3, 0, 0, 1, 0, 0, 5, 5, 1, 2, 5, 0],
                [0, 0, 0, 0, 40, 35, 40, 0, 0, 1, 2, 1, 5],
                [0, 10, 0, 20, 0, 30, 0, 40, 0, 50, 0, 60],
                [3, 10],
                [0, 0, 0, 0, 8, 0, 0, 8, 0, 0, 10, 0, 0, 10, 0, 10],
                [],
                [0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 0, 0, 1]
            ],
            singular: 'login',
            plural: 'logins',
            timezones: ['local', 'utc', 'America/Los_Angeles'],
            timezoneIndex:0
        });
    });
</script>
```

## Examples
Visit the project page to see live examples:

http://melenaos.github.io/jquery-punchcard/#examples

## License

Punchcard is released under the MIT License. See [LICENSE][1] file for
details.


Created by Menelaos Vergis.

[1]: https://github.com/melenaos/jquery-punchcard/blob/master/LICENSE
