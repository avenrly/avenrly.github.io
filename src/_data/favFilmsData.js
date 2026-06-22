const favFilms = require('./favFilms.json');
const media = require('./media.json');


module.exports = favFilms.map(favourite => { 
    const match = media.find(film => film.title === favourite.title);

    return {
        ...favourite,
        ...match
    };
});