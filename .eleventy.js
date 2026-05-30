const fs = require("fs");
const path = require("path");

module.exports = config => {
  config.addPassthroughCopy({
    "./src/css": "css"
    });

  config.addPassthroughCopy({
    './src/images': 'images'
  });

config.addFilter("breadcrumbs", function(url) {

    const parts = url
      .split("/")
      .filter(Boolean);

    let current = "";

    return parts.map(part => {

      current += `/${part}`;

      return {
        name: decodeURIComponent(part)
                .replace(/-/g, " ")
                .trim(),

            url: current + "/"
      };

    });

  });

config.addFilter("folderImages", function(folder) {

  if (typeof folder !== "string" || !folder.trim()) {
        return [];
    }
    const imageFolder = path.join(
      "src",
      folder
    );

    // Folder does not exist
    if (!fs.existsSync(imageFolder)) {
        return [];
    }

    return fs.readdirSync(imageFolder)
      .filter(file =>
        /\.(png|jpg|jpeg|webp|gif)$/i.test(file)
      )
      .map(file =>
        `/${folder}/${file}`
      );

  });

config.addCollection("portfolio", function(collectionApi) {
return collectionApi.getFilteredByTag("portfolio")
  .sort((a, b) => b.data.year - a.data.year);
});

  return {
    dir: {
      input: 'src/content',
      output: 'dist',
      layout: '../_includes/layouts',
      includes:'../_includes',
    }
  };
};

