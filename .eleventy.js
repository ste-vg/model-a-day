const fs = require('fs');

const site = require('./src/_data/site.json');

const scssFilter = require("./src/filters/scss-filter");
const cssMinFilter = require("./src/filters/css-min-filter");
const jsMinFilter = require("./src/filters/js-min-filter");

module.exports = function(config) {
  
  config.setUseGitIgnore(false);
  config.addPassthroughCopy({"./src/assets/": "/" });
  config.addPassthroughCopy('src/robots.txt');

  config.addFilter("scss", scssFilter);
  config.addFilter("cssmin", cssMinFilter);
  config.addFilter("jsmin", jsMinFilter);

  config.addWatchTarget("./src/_includes/compiled/*.js");
  config.addWatchTarget("./src/**/*.scss");

  const fourOhFour = 'dist/404.html';
  if(fs.existsSync(fourOhFour))
  {
    config.setBrowserSyncConfig({
      callbacks: {
        ready: function(err, browserSync) {
          const content_404 = fs.readFileSync(fourOhFour);

          browserSync.addMiddleware('*', (req, res) => {
            // Provides the 404 content without redirect.
            res.write(content_404);
            res.end();
          });
        }
      }
    });
  }
  else
  {
    console.log('skipped 404 redirect for this one');
  }

  return {
    dir: {
      input: 'src',
      output: 'dist'
    },
    passthroughFileCopy: true
  };
};
