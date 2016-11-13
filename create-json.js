'use strict';

var colors = require('colors/safe'),
    path = require('path'),
    fs = require('fs');

var projectsClass = function (cwd) {
    var self = this;

    self.addProjectDir = function (dir, target) {
        var readmeFilePath = path.join(dir, 'README.md'),
            content;

        try {
            content = fs.readFileSync(readmeFilePath, 'utf8');
        } catch (ex) {
            console.error(ex);
            return;
        }

        var projectTemplate = { name: null, url: null, content: '', contributors: '', needsContribution: false },
            splittedContent = content.split('\n'),
            state = 0, // 0 = awaiting subject, 1 = awaiting url, 2 = awaiting content
            current = Object.assign({}, projectTemplate);

        for (var i = 0, length = splittedContent.length; i < length; i++) {
            var line = splittedContent[i];

            if (line.substring(0, 3) === '## ') {
                if (state !== 0) {
                    target.push(current);
                    current = Object.assign({}, projectTemplate);
                }

                current.name = line.substring(3);
                state = 1;
                continue;
            }

            if (state === 1) {
                current.url = line.trim();
                if (current.url.length > 0) {
                    current.url = current.url.substring(1, current.url.indexOf(']'));
                    state = 2;
                }
                continue;
            }

            if (state === 2) {
                current.content += line.trim();
            }
        }

        if (state !== 0) {
            target.push(current);
        }

        // console.log(content);
    };

    self.addDir = function (dir) {
        fs.readdirSync(dir).forEach(function (file) {
            var filePath = path.join(dir, file),
                stat = fs.statSync(filePath);

            if (!stat.isDirectory()) {
                return;
            }

            self.output[file] = [];
            self.addProjectDir(filePath, self.output[file]);
        });
    };

    self.parse = function () {
        self.output = {};
        self.addDir(path.join(cwd, 'Icerik', 'Projeler'));

        return self.output;
    };

    self.writeToFile = function (filePath) {
        var content = JSON.stringify(self.parse(), null, '  ');

        fs.writeFileSync(path.join(cwd, filePath), content);
    };
};

var projects = new projectsClass(__dirname);

projects.writeToFile('projects.json');

console.log(colors.yellow('done.'));
