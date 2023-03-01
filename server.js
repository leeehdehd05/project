const express = require('express'); //express첨부와 사용하겠다는 코드 
const req = require('express/lib/request');
const app = express();
const path = require("path")
const http = require("http")
const server = http.createServer(app);
const socketIO = require("socket.io")
const { ObjectId } = require('mongodb');
const io = require("socket.io")(server);
const methodOverride = require('method-override');
const { Socket } = require('dgram');
app.use(methodOverride('_method'))
const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true })); //form 데이터를 서버로 쉽게 전송하기 위한 body-parser 설치 <이미 express에서 포함 되있기 때문에 이 코드로 대체
app.use(express.static('css')); //css를 사용하겠다는 코드
app.use(express.static('img')); //img를 사용하겠다는 코드
app.use(express.static('views'))
app.use(express.static(path.join(__dirname, "src")))


MongoClient.connect('mongodb+srv://admin:asdf1234@cluster0.3qenw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
  , function (에러, client) { //MongoDB를 연결해주는 링크 (아이디와 비밀번호 포함)


    db = client.db('sever');

    server.listen(8080, function () {
      console.log('listening on 8080') //원하는 포트에 서버를 오픈 하는 문법
    });



    app.get('/votingview/:id', function (요청, 응답) {
      db.collection('votinglist').findOne({ _id: parseInt(요청.params.id) }, function (에러, result1) {
        db.collection('vote').find({ "글번호": 요청.params.id }).toArray(function (에러, 결과) {



          db.collection('votingcomment').find({ "글번호": 요청.params.id }).toArray(function (error, result2) {
            응답.render('votingview.ejs', { data: result1, commentdata: result2, user: 요청.user, posts: 결과 })
          })
        })

      })
    })


    app.get('/search', (요청, 응답) => {
      var 검색조건 = [
        {
          $search: {
            index: 'titleSearch',
            text: {
              query: 요청.query.value,
              path: '제목'
            }
          }
        }
      ]
      db.collection('post').aggregate(검색조건).toArray((에러, 결과) => {
        console.log(결과)
        응답.render('search.ejs', { posts: 결과 })
      })
    })


    const passport = require('passport');
    const LocalStrategy = require('passport-local');
    const session = require('express-session');

    app.use(session({ secret: '비밀코드', resave: true, saveUninitialized: false }));
    app.use(passport.initialize());
    app.use(passport.session());

    app.get('/', function (요청, 응답) {
      응답.render('login.ejs')
    })


    app.post('/', passport.authenticate('local', {
      failureRedirect: '/fail'
    }), function (요청, 응답) {
      응답.redirect('/main')
    });



    passport.use(new LocalStrategy({
      usernameField: 'id',
      passwordField: 'pw',
      session: true,
      passReqToCallback: false,

    }, function (입력한아이디, 입력한비번, done) {


      //console.log(입력한아이디, 입력한비번);
      db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {

        if (에러) return done(에러)

        if (!결과) return done(null, false, { message: '존재하지않는 아이디' })
        if (입력한비번 == 결과.pw) {
          return done(null, 결과)
        } else {
          return done(null, false, { message: '틀린 비밀번호' })
        }
      })
    }));

    passport.serializeUser(function (user, done) {
      done(null, user.id)
    });

    passport.deserializeUser(function (아이디, done) {
      db.collection('login').findOne({ id: 아이디 }, function (에러, 결과) {
        done(null, 결과)
      })
    });

    function 로그인했니(요청, 응답, next) {
      if (요청.user) {
        next()

      }
      else {
        응답.send('로그인이 확인되지 않았습니다.')
      }
    }




    app.get('/logout', function (req, res) {
      req.logout();
      req.session.save(function () {
        res.redirect('/');
      })
    })


    app.post('/register', function (요청, 응답) {
      db.collection('login').insertOne({ id: 요청.body.id, pw: 요청.body.pw, 성별: 요청.body.성별, 나이: 요청.body.나이 }, function (에러, 결과) {
        응답.redirect('/')
      })
    })
    app.post('/add', function (요청, 응답) {
      db.collection('counter').findOne({ name: '게시물갯수' }, function (에러, 결과) {
        console.log(결과.totalPost)
        console.log(요청.body.title);
        console.log(요청.body.content);
        console.log(요청.body.writer);
        var 총게시물갯수 = 결과.totalPost;

        var 저장할거 = { _id: 총게시물갯수 + 1, 아이디: 요청.user._id, 제목: 요청.body.title, 내용: 요청.body.content, 작성자: 요청.body.writer }


        db.collection('post').insertOne(저장할거, function (에러, 결과) {
          console.log('저장완료');
          db.collection('counter').updateOne({ name: '게시물갯수' }, { $inc: { totalPost: 1 } }, function (에러, 결과) {
            if (에러) { return console.log(에러) }
            응답.redirect('/list')
          });
        });
      });
    });

    app.post('/add3', function (요청, 응답) {
      db.collection('onetoonecounter').findOne({ name3: '게시물갯수' }, function (에러, 결과) {

        console.log(요청.body.title);
        console.log(요청.body.content);
        console.log(요청.body.writer);
        var 총게시물갯수 = 결과.totalPost3;

        var 저장할거 = { _id: 총게시물갯수 + 1, 아이디: 요청.user._id, 제목: 요청.body.title, 내용: 요청.body.content, 작성자: 요청.body.writer }

        db.collection('onetoone').insertOne(저장할거, function (에러, 결과) {
          console.log('저장완료');
          db.collection('onetoonecounter').updateOne({ name3: '게시물갯수' }, { $inc: { totalPost3: 1 } }, function (에러, 결과) {
            if (에러) { return console.log(에러) }
            응답.redirect('/onetoone')
          });
        });
      });
    });


    app.post('/add2', function (요청, 응답) {
      db.collection('votingcounter').findOne({ name2: '게시물갯수' }, function (에러, 결과) {
        console.log(결과.totalPost2)
        console.log(요청.body.title2);
        console.log(요청.body.content2);
        console.log(요청.body.writer2);
        var 총게시물갯수 = 결과.totalPost2;

        var 저장할거 = { _id: 총게시물갯수 + 1, 아이디: 요청.user._id, 제목: 요청.body.title, 찬성: 요청.body.agreement, 반대: 요청.body.opposition, 작성자: 요청.body.writer }

        db.collection('votinglist').insertOne(저장할거, function (에러, 결과) { //MongoDB에 제목,내용,작성자를 보내주는 코드
          console.log('저장완료');
          db.collection('votingcounter').updateOne({ name2: '게시물갯수' }, { $inc: { totalPost2: 1 } }, function (에러, 결과) {
            if (에러) { return console.log(에러) }
            응답.redirect('/voting')
          });
        });
      });
    });

    app.get('/', function (요청, 응답) {
      응답.render('login.ejs')
    });

    app.get('/main', 로그인했니, function (요청, 응답) {
      응답.render('main2.ejs')
    });

    app.get('/loading', function (요청, 응답) {
      응답.render('loading.ejs')
    });

    app.get('/write', 로그인했니, function (요청, 응답) {
      응답.render('write.ejs')
    });


    app.get('/votingwrite', 로그인했니, function (요청, 응답) {
      응답.render('votingwrite.ejs')
    });

    app.get('/register', function (요청, 응답) {
      응답.render('register.ejs')
    });

    app.get('/voting', 로그인했니, function (요청, 응답) {
      db.collection('votinglist').find().toArray(function (에러, 결과) {
        console.log(결과);
        응답.render('voting.ejs', { posts: 결과, user: 요청.user });
      });

    });


    app.delete('/delete', 로그인했니, function (요청, 응답) {
      요청.body._id = parseInt(요청.body._id);
      db.collection('post').deleteOne({ _id: 요청.body._id, 아이디: 요청.user._id }, function (에러, 결과) {
        console.log('삭제완료');

        응답.status(200).send({ message: '성공했습니다' });
      })

    });

    app.delete('/delete2', 로그인했니, function (요청, 응답) {
      요청.body._id = parseInt(요청.body._id);
      db.collection('votinglist').deleteOne({ _id: 요청.body._id, 아이디: 요청.user._id }, function (에러, 결과) {
        console.log('삭제완료');

        응답.status(200).send({ message: '성공했습니다' });
      })

    });



    app.get('/edit/:id', 로그인했니, function (요청, 응답) {
      db.collection('post').findOne({ _id: parseInt(요청.params.id), 아이디: 요청.user._id }, function (에러, 결과) {
        console.log(결과)
        응답.render('edit.ejs', { post: 결과 })
      })
    })

    app.put('/edit', 로그인했니, function (요청, 응답) {
      db.collection('post').updateOne({ _id: parseInt(요청.body.id) },
        { $set: { 제목: 요청.body.title, 작성자: 요청.body.writer, 내용: 요청.body.content } }, function (에러, 결과) {
          console.log('수정완료')
          응답.redirect('/list')
        })

    })

    app.get('/vodtingviewedit/:id', 로그인했니, function (요청, 응답) {
      db.collection('votinglist').findOne({ _id: parseInt(요청.params.id), 아이디: 요청.user._id }, function (에러, 결과) {
        console.log(결과)
        응답.render('votingviewedit.ejs', { post: 결과 })
      })
    })

    app.put('/votingviewedit', 로그인했니, function (요청, 응답) {
      db.collection('votinglist').updateOne({ _id: parseInt(요청.body.id) },
        { $set: { 제목: 요청.body.title, 작성자: 요청.body.writer } }, function (에러, 결과) {
          console.log('수정완료')
          응답.redirect('/voting')
        })

    })

    app.get('/list', 로그인했니, function (요청, 응답) {
      db.collection('post').find().toArray(function (에러, 결과) {
        console.log(결과);
        응답.render('list.ejs', { posts: 결과, user: 요청.user });
      });
    });


  });




app.get('/view/:id', function (요청, 응답) {
  db.collection('post').findOne({ _id: parseInt(요청.params.id) }, function (error, result1) {
    db.collection('comment').find({ "글번호": 요청.params.id }).toArray(function (error, result2) {
      응답.render('view.ejs', { data: result1, commentdata: result2, user: 요청.user })

    })

  })
})

app.post('/votingcomment', function (요청, 응답) {
  var 저장할거 = { 댓글: 요청.body.comment, 댓글작성자: 요청.body.commentwriter, 글번호: 요청.body.parentnumber }
  db.collection('votingcomment').insertOne(저장할거, function (에러, 결과) {

  })
})



app.post('/comment', function (요청, 응답) {
  var 저장할거 = { 댓글: 요청.body.comment, 댓글작성자: 요청.body.commentwriter, 글번호: 요청.body.parentnumber }
  db.collection('comment').insertOne(저장할거, function (에러, 결과) {

  })
})



