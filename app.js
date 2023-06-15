const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DBError:${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
const convertDBObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};
//Get List Of All Movies API
app.get("/movies/", async (request, response) => {
  const getAllMoviesQuery = `
    SELECT movie_name as movieName
    FROM movie
    ORDER BY movie_id;`;
  const allMoviesArray = await db.all(getAllMoviesQuery);
  response.send(allMoviesArray);
});
//Create New Movie API
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    INSERT INTO
    movie (director_id,movie_name,lead_actor)
    VALUES (${directorId},'${movieName}','${leadActor}');`;
  await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});
//Get Movie based on movie id API
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieIdQuery = `
    SELECT movie_id as movieId,
    director_id as directorId,
    movie_name as movieName,
    lead_actor as leadActor
    FROM movie 
    WHERE
    movie_id = ${movieId};`;
  const getMovieDetails = await db.get(getMovieIdQuery);
  response.send(getMovieDetails);
});
//Update Movie Details API
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const updateMovieDetails = request.body;
  const { directorId, movieName, leadActor } = updateMovieDetails;
  const updateMovieQuery = `
    UPDATE movie
    SET director_id=${directorId},
    movie_name='${movieName}',
    lead_actor='${leadActor}'
    WHERE movie_id =${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//Delete Movie API
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM
    movie WHERE
    movie_id=${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});
const convertIntoCamelCase = (eachObject) => {
  return {
    directorId: eachObject.director_id,
    directorName: eachObject.director_name,
  };
};
//Get directors API
app.get("/directors/", async (request, response) => {
  const getAllDirectorsQuery = `
    SELECT * FROM
    director
    ORDER BY director_id;`;
  const getAllDirectorsArray = await db.all(getAllDirectorsQuery);
  response.send(
    getAllDirectorsArray.map((eachDirector) =>
      convertIntoCamelCase(eachDirector)
    )
  );
});
//Get All Movies Directed By Specific Directors API
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    SELECT movie_name as movieName
    FROM movie WHERE 
    director_id=${directorId};`;
  const getDirectorMovies = await db.all(getDirectorMoviesQuery);
  response.send(getDirectorMovies);
});

module.exports = app;
