const favShows = require('./favShows.json');
const media = require('./media.json');


module.exports = favShows.map(favourite => { 
    const match = media.find(film => film.title === favourite.title);

    return {
        ...favourite,
        ...match
    };
});