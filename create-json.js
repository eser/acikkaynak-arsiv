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

        var splittedContent = content.split('\n'),
            redundantState = true,
            current = { name: null, content: '' };

        for (var i = 0, length = splittedContent.length; i < length; i++) {
            var line = splittedContent[i];

            if (line.substring(0, 3) === '## ') {
                if (!redundantState) {
                    target.push(current);
                    current = { name: null, content: '' };
                }

                redundantState = false;
                current.name = line.substring(3);
                continue;
            }

            if (!redundantState) {
                current.content += line.trim();
            }
        }

        if (!redundantState && current.content.length > 0) {
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
        self.addDir(path.join(cwd, 'Projeler'));

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
