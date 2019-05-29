var fs = require('fs').promises;
var flat = require('array.prototype.flat');
var WPAPI = require( 'wpapi' );
var path = require('path');
var mustache = require('mustache');
var markdown = require( "markdown" ).markdown;
var username = process.argv[2];
var password = process.argv[3];
var sourceDirName = process.argv[4];
var extrasFileName = process.argv[5];
var menuFileName = process.argv[6];
var dirName = process.argv[7];
var output = "./output";
var outputExtension = "html";
var merge = (objects) => {
  var target = {};
  objects.forEach(object => Object.assign(target, object));
  return target;
};
var wp = new WPAPI({
    endpoint: 'https://www.slamdata.com/wp-json',
    username: username,
    password: password
});
var allFiles = (dirPath, names) => Promise.all(names.map(name => fs.readFile(path.normalize(path.join(dirPath, name)), 'utf-8')));

mustache.escape = text => text;

Promise.all([fs.readdir(path.normalize(dirName)), fs.readdir(path.normalize(sourceDirName))])
  .then(fileNameResults => {
    console.log(fileNameResults)
    var folderFileNames = fileNameResults[0];
    var sourceFileNames = fileNameResults[1];

    var templateFileNames = folderFileNames.filter(fileName => fileName.split('.').pop() === "md");
    var valueFileNames = folderFileNames.filter(fileName => fileName.split('.').pop() === "json");
    var filteredSourceFileNames = sourceFileNames.filter(fileName => fileName.split('.').pop() === "json");

    var templates = allFiles(dirName, templateFileNames);
    var values = allFiles(dirName, valueFileNames);
    var sources = allFiles(sourceDirName, filteredSourceFileNames);
    var extra = fs.readFile(path.normalize(extrasFileName));
             
    return Promise.all([templates, values, sources, extra]).then(results => {
      var templates = results[0];
      var values = results[1];
      var sources = results[2];
      var extra = results[3];
      return Promise.all(filteredSourceFileNames.map((sourceFileName, sourceFileIndex) => {
        var source = sources[sourceFileIndex];
        return Promise.all(templateFileNames.map((templateFileName, templateFileIndex) => {
          var template = templates[templateFileIndex];
          return Promise.all(valueFileNames.map((valueFileName, valueFileIndex) => {
            var value = values[valueFileIndex];
            var sourceName = sourceFileName.split(".").slice(0, -1).join(".");
            var destName = valueFileName.split(".").slice(0, -1).join(".");
            var templateName = templateFileName.split(".").slice(0, -1).join(".");
            var rendered = markdown.toHTML(mustache.render(template, merge([JSON.parse(value), JSON.parse(source), JSON.parse(extra)])));
            var title = templateName + " " + sourceName + " " + destName;
            console.log(templateFileName);
            console.log(sourceFileName);
            console.log(valueFileName);
            return wp.pages().create({
              title: title,
              content: "<div class=\"autospiel\">" + rendered + "</div>",
              status: 'draft'
            });
	  }));
	}));
      }));
    })
  }).then(pages => {
    var pages = flat(pages, 2);
    var title = path.normalize(dirName).split('/').pop();
    fs.readFile(path.normalize(menuFileName), 'utf-8').then(menu => {
      var menuContent = "<div class=\"autospiel\">" + markdown.toHTML(mustache.render(menu, { title: title, pages: pages })) + "</div>";
      return wp.pages().create({
        title: title,
        content: menuContent,
        status: 'draft'
      });
    });
  });
