require("dotenv").config();

const { Client } = require("@notionhq/client");
const fs = require("fs");
const allTagsSet = new Set();

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

async function fetchDatabase() {

  // PAGNATION
  let results = [];
  let cursor = undefined;

  do {
    const response = await notion.dataSources.query({
      data_source_id: process.env.NOTION_DATA_SOURCE_ID,
      start_cursor: cursor,
    });

    results.push(...response.results);

    cursor = response.has_more ? response.next_cursor : undefined;

  } while (cursor);

  //FILTER OUT UNWATCHED
  const filteredResults = results.filter(page => {
    const status = page.properties.Status?.status?.name;
    return status !== "Not started" && status !== "Dropped";
  });

  // (optional debug logs)
  console.log("Total:", results.length);
  console.log("After filter:", filteredResults.length);

  // MAP FILTERED RESPONSE
  const media = filteredResults.map(page => {

  const props = page.properties;

  return {
    title:
      props.Name?.title?.[0]?.plain_text || "",

    status:
      props.Status?.status?.name || "",

    tags:
      (props.Tags?.multi_select || []).map(tag => {
        allTagsSet.add(tag.name);
        return tag.name;
      }),

    type:
      props.Type?.select?.name || "",

    rating:
      props["My Rating"]?.select?.name || "",

    comment:
      (props.Comment?.rich_text || [])
        .map(text => text.plain_text)
        .join("") || "",

    watchCount:
      props["Watch Count"]?.number || 0,

    streamingService:
      props["Streaming Service"]?.select?.name || "",

    date:
      props["Created time"]?.last_edited_time?.split("T")[0] || "",
  };
});



fs.writeFileSync(
  "./src/_data/media.json",
  JSON.stringify(media, null, 2)
);

  const allTags = [...allTagsSet].sort();

  console.log(allTags);
  fs.writeFileSync(
  "./src/_data/mediaTags.json",
  JSON.stringify(allTags, null, 2)
);
  console.log(`Saved ${media.length} entries`);
}

fetchDatabase();