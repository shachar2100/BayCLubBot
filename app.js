/**
 * app.js -> runs the server and connects all files:
 *    *form.html
 *    *botty.js
 */


 var sqlite3 = require('sqlite3').verbose();
 var express = require('express');
 var http = require('http');
 var path = require("path");
 var bodyParser = require('body-parser');
 var helmet = require('helmet');
 var port = 8000;


 var app = express();
 var server = http.createServer(app);

 /**
  * Were Database is Stored: 
  */
 var db = new sqlite3.Database('./database/Classes.db');
 app.use(bodyParser.urlencoded({extended: false}));
 app.use(express.static(path.join(__dirname,'./public')));
 app.use(helmet());
 
 /**
  * Creating sql data base
  */
 db.run('CREATE TABLE IF NOT EXISTS emp(username TEXT, password TEXT, day TEXT, time TEXT, instructor TEXT)');

 
 app.get('/', function(req,res){
    res.sendFile(path.join(__dirname,'./public/form.html'));
  });

// Add To database
 app.post('/addClass', function(req,res){
    db.serialize(()=>{
      db.run('INSERT INTO emp(username,password,day,time,instructor) VALUES(?,?,?,?,?)', [req.body.us, req.body.ps, req.body.day, req.body.time, req.body.inst], function(err) {
        if (err) {
          return console.log(err.message);
        }
        console.log("New Class has been added");
        res.send("New class has been added into the database with User = "+ req.body.us + " ,Password = "+req.body.ps + " ,day: " + req.body.day + " ,time:" + req.body.time + " and instructor:" + req.body.inst);
      });
  
    });
  
  }); 


// Closing the database connection.
 app.get('/close', function(req,res){
    db.close((err) => {
      if (err) {
        res.send('There is some error in closing the database');
        return console.error(err.message);
      }
      console.log('Closing the database connection.');
      res.send('Database connection successfully closed');
    });
  
});

 server.listen(port, function(){
    console.log("server is listening on port: 8000");
  });
/******************************************************************************************** */

  /**
 * Translator.js -> Takes information from server and runs botty.js using 
 * the information
 */

 var sqlite3 = require('sqlite3').verbose();
 var db = new sqlite3.Database('./database/Classes.db');
 var now = new Date(); //Current Date
 var delay =  3 // deley of days in the app (bayClub)
 var weekNum = {
    1:"Mo",
    2:"Tu",
    3:"We",
    4:"Th",
    5:"Fr",
    6:"Sa",
    7:"Su" 
 }

 

 //Every day at 1:
 //new Date(year, monthIndex, day, hours, minutes, seconds, milliseconds)
 var millisTill1 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 2, 1, 0, 0) - now;
 if (millisTill1 < 0) {
     millisTill1 += 86400000; // it's after 1am, try 1am tomorrow.
 }

 setTimeout(function(){
  console.log("Its 1am bitches")
 
  db.serialize(()=>{
    db.each('SELECT username US ,day DAY , time TIME FROM emp WHERE day =?', [getCorrectDay()], function(err,row){     //db.each() is only one which is funtioning while reading data from the DB
      if(err){
        res.send("Error encountered while displaying");
        console.log("Error: " + err)
        //return console.error(err.message);
      }
      
      var user ={
          us: row.US,
          time: row.TIME
        }; // will have a problem if there are multiple classes in one day with the same username
      console.log("USER: " + user.us +" " + user.time);
      runBotty(user);
      
    });
  });
 }, millisTill1);






/**
 * 
 * @param {*} user 
 * username
 * time
 */
  function runBotty(user){
      console.log("Im here:)")
      var time = user.time.split(":");
      var millisTillClass = new Date(now.getFullYear(), now.getMonth(), now.getDate(), time[0], time[1], 0, 0) - now + 120000; // + 2min
      console.log("millTillClass: " + millisTillClass)
      setTimeout(function(){
        console.log("Its time to sign up for class :)");
        
        //calling botty:)
        db.serialize(()=>{
            db.each('SELECT username US, password PS, day DAY , time TIME, instructor INS FROM emp WHERE username =? AND time =? ', [user.us, user.time], function(err,row){     //db.each() is only one which is funtioning while reading data from the DB
                if(err){
                  return console.error(err.message);
                }
                console.log(row.US + " " + row.PS + " " + row.TIME);
                bot(row.US, row.PS, row.DAY, row.TIME, row.INS);
            });
        });
       }, millisTillClass);
      
  }

  /**
   * getCorrectDay() 
   * @returns the correct day since there is a delay of 3 days
   */
  function getCorrectDay(){
    var today = new Date();
    console.log(today.getDay())
    today = today.getDay() + delay 
    if(today > 7 ){
        today = today - 7
    }
    console.log(today)    
    return weekNum[today]
  }



/******************************************************************************************** */

/**
 * botty.js -> inspired by bayClub.js
 * Author: Shachar Habusha
 * Date: 1/17/2022
 */

//bot()

function bot(username = "", password = "", day="Mo", startTime="", instructorName=""){

  const puppeteer = require('puppeteer');
  const chromeOptions = {
      executablePath:"C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      headless:false, 
      slowMo:15,
      ignoreDefaultArgs: ["--enable-automation"],
      defaultViewport: null,
      //devtools:true,
      ignoreHTTPSErrors: true,
  };

  puppeteer.launch(chromeOptions).then(async (browser) =>{
      //  const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto('https://bayclubconnect.com/account/login/connect');
      await page.screenshot({ path: 'Images/login.png' });



      /**
       * Login:
       */
      await page.type('#username',username,{delay: 100}) // Types slower, like user
      await page.type('#password',password,{delay: 100}) // Types slower, like user
      page.click('body > app-root > div > app-login > div > app-login-connect > div.row.d-flex.justify-content-center > div > div > div > form > button')
      
      
      await page.waitForNavigation({
      /**
       * Note:
       * networkidle2: consider navigation to be finished when there are no more than 2 network connections for at least 500 ms.
       */
      waitUntil: 'networkidle2',
      });
      
      await page.screenshot({ path: 'Images/logedIn.png' });

      /**
       * Find Classe(s):
       * Name | Example
       * _______________
       * Club | Carmel Valley (Scroll Bar)
       * Category | many diffrent categories (Scroll bar with check box & can have multiple options)
       * Time range | Morning, Afternoon, Evening
       * Search classes, instructors... | type bar (Disappering)
       * https://bayclubconnect.com/classes
       */
      await page.goto('https://bayclubconnect.com/classes'); //goes to classes
      await page.waitForNavigation({
          waitUntil: 'networkidle2',
      });


      await page.waitForTimeout(1000)
      await dropdown("body > app-root > div > app-classes-shell > app-classes > div > div:nth-child(2) > div > app-classes-filters > div > form > div:nth-child(4) > div > app-date-slider > div > div.col > gallery > gallery-core > div > gallery-slider > div > div > gallery-item.g-active-item > div > div > div:nth-child(",") > div.text-uppercase.size-12.pt-1.pt-md-0", day,2 )
      
       /** Classes List: */
        //document.querySelector("body > app-root > div > app-classes-shell > app-classes > div > app-classes-list > div > div:nth-child(1) > app-classes-can-book-item > app-class-list-item > div > div.row.d-flex.d-md-none.item-tile.mb-2.py-3.align-items-center > div > div.row.mb-1 > div > div:nth-child(1)")
        await page.waitForTimeout(2000)
        try{
          await page.waitForTimeout(500);
          for (let i  = 1;i < 20; i++){
            var pathTime = "body > app-root > div > app-classes-shell > app-classes > div > app-classes-list > div > div:nth-child("+i+") > app-classes-can-book-item > app-class-list-item > div > div.row.d-flex.d-md-none.item-tile.mb-2.py-3.align-items-center > div > div.row.mb-1 > div > div:nth-child(1)"
            var pathInstructor = "body > app-root > div > app-classes-shell > app-classes > div > app-classes-list > div > div:nth-child("+i+") > app-classes-can-book-item > app-class-list-item > div > div.row.d-flex.d-md-none.item-tile.mb-2.py-3.align-items-center > div > div.row.align-items-center > div.col.size-12.grey > div:nth-child(2)"
            try{
              var time = await page.$eval(pathTime, el => el.textContent)
              var instructor = await page.$eval(pathInstructor, el => el.textContent)
            }catch(err){
              continue
            }
            //var firstTime 
            //&& isnt working for some stupid reason
            if(time.includes(startTime) && instructor.includes(instructorName)){
              //document.querySelector("body > app-root > div > app-classes-shell > app-classes > div > app-classes-list > div > div:nth-child(1) > app-classes-can-book-item > app-class-list-item > div > div.row.d-flex.d-md-none.item-tile.mb-2.py-3.align-items-center > div > div.row.align-items-center > div.col-auto.text-center > div")
              await page.click("body > app-root > div > app-classes-shell > app-classes > div > app-classes-list > div > div:nth-child("+i+") > app-classes-can-book-item > app-class-list-item > div > div.row.d-none.d-md-flex.size-12.item-tile.mb-2.py-3.px-3.align-items-center.clickable > div.col-2.text-center > div")
              await page.waitForTimeout(2000)
              //document.querySelector("body > modal-container > div > div > app-universal-confirmation-modal > div.modal-body.white-bg.mt-2 > div > div > div:nth-child(4) > div > button.btn.white.darker-blue-bg.font-weight-bold.py-2.mx-2.text-uppercase > span")
             //document.querySelector("body > modal-container > div > div > app-universal-confirmation-modal > div.modal-body.white-bg.mt-2 > div > div > div:nth-child(4) > div > button.btn.white.darker-blue-bg.font-weight-bold.py-2.mx-2.text-uppercase > span")
              await page.click("body > modal-container > div > div > app-universal-confirmation-modal > div.modal-body.white-bg.mt-2 > div > div > div:nth-child(4) > div > button.btn.white.darker-blue-bg.font-weight-bold.py-2.mx-2.text-uppercase > span") 
             break;          
            }
            console.log(time + " " + instructor)
            console.log("Time: " + time.includes(startTime) + " " + "Instructor: " + time.includes(startTime) +  " bouth: " + ((time.includes(startTime)) && (pathInstructor.includes(instructor)) ))
           
          }       
        }catch(e){
          console.log(startTime + " is not in system")
          console.log(e)
        }
      /**
       * dropdown
       * selects the user input
       * @param {*} query1 - first pcleaart of path 
       * @param {*} query2 - second part of path
       * @param {*} userinput 
       * @returns 
       */
      async function dropdown (query1,query2,userinput , start = 1){

          try{
            await page.waitForTimeout(500);
            for (let i  = start;i < 10; i++){
              var pathName = query1 + i + query2
              website = await page.$eval(pathName, el => el.textContent)
              if(website == userinput){
                page.click(pathName)
                return i;
              }
              console.log(website)
            }       
          }catch(e){
            console.log(userinput + " is not in system")
            console.log(e)
          }
      }
  
        
      /**
      * Book Class
      */
    
      //await browser.close();
      console.log("Finished :0")
  });
}

