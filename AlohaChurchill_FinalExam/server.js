var express = require('express');
var bodyParser = require('body-parser'); 
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const axios = require('axios');
const qs = require('query-string');

var pgp = require('pg-promise')();

const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'final_project_db',
  user: 'postgres',
  password: 'final2021'
}

var db = pgp(dbConfig);

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/'));

var id = 5;

app.get('/', function(request, response){
    response.render('pages/main', {
        title: 'Home',
        items: '',
        error: false,
        message: 'Home page'
    });
});

app.post('/get_movies', function(request, response) {
    var title = request.body.search_term; 
    var api_key = '8cb052bf'; 

    if(title) {
      axios({
        url: `http://www.omdbapi.com/?t=${title}&apikey=${api_key}`,
          method: 'GET',
          dataType:'json',
        })
        .then(items => {
          response.render('pages/main', {
            title: 'Home',
            items: items.data,
            error: false,
            message: 'Worked'
          });
        })
        .catch(error => {
          if (error.response) {
            console.log("ERROR!");
            console.log(error.response.data);
            console.log(error.response.status);
          }
          response.render('pages/main', {
            title: 'error',
            items: '',
            error: true,
            message: 'Error!'
          });
        });
    }
    else {
      response.render('pages/main', {
        title: 'error',
        items: '',
        error: true,
        message: 'Error!'
      });
    }
  });

app.post('/reviews', function(request, response) {
  var title = request.body.movie_title_input;
  var reviews = request.body.reviews_input;
  var date = new Date().toISOString().slice(0,10);
  var insert_statement = "INSERT INTO movie_table_final (movie_title, review, review_date) VALUES (\'" + title + "\',\'" + reviews + "\','" + date + "\')";
  var get_statement = "SELECT * FROM movie_table_final";
  
  db.task('get-everything', task => {
    return task.batch([
      task.any(insert_statement),
      task.any(get_statement)
    ]);
  })
  .then(info => {
    response.render('pages/reviews', {
      title: "Reviews",
      items: info[1],
      error: false,
      message: 'reviews page'
    });    
  })
  .catch(err => {
    console.log('error', err);
    response.render('pages/reviews', {
      title: "Reviews",
      items: '',
      error: true,
      message: 'error'
    })
  });
});

app.get('/reviews', function(request, response){
  var get_statement = "SELECT * FROM movie_table_final";
  db.any(get_statement)
  .then(function(rows){
    response.render('pages/reviews', {
      title: "Reviews",
      items: rows,
      error: false,
      message: 'reviews page'
    });
  })
  .catch(function(err){
    console.log('error', err);
    response.render('pages/reviews', {
      title: "Reviews",
      items: '',
      error: true,
      message: 'error'
    })    
  });
});

app.post('/filter_reviews', function(request, response){
  var search_title = request.body.search_title;
  var get_statement = "SELECT * FROM movie_table_final";
  var get_statement_filtered = "SELECT * FROM movie_table_final WHERE movie_title=\'"+ search_title + "\'";
  
  db.task('get-everything', task => {
    return task.batch([
      task.any(get_statement),
      task.any(get_statement_filtered)
    ]);
  })
  .then(info => {
    if(info[1].length == 0){
      response.render('pages/reviews', {
        title: "Reviews",
        items: info[0],
        error: false,
        message: 'reviews page'
      });      
    }
    else{
      response.render('pages/reviews', {
        title: "Reviews",
        items: info[1],
        error: false,
        message: 'reviews page'
      });        
    }
  })
  .catch(function(err){
    console.log('error', err);
    response.render('pages/reviews', {
      title: "Reviews",
      items: '',
      error: true,
      message: 'error'
    })    
  });
  
});

app.listen(3000);
console.log("Application running on localhost:3000");