/**
 * Translator.js -> Takes information from server and runs botty.js using 
 * the information
 */
 //import {bot} from "botty.js";
 //var b = require("./botty.js");
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
    0:"Su" 
 }

 

 //Every day at 1:
 var millisTill1 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 22, 0, 0) - now;
 if (millisTill1 < 0) {
     millisTill1 += 86400000; // it's after 1am, try 1am tomorrow.
 }
console.log(getCorrectDay())
 setTimeout(function(){
  console.log("Its 1am bitches")
  
 }, millisTill1);


 usernames = [];
 db.serialize(()=>{
    db.each('SELECT username US ,day DAY , time TIME FROM emp WHERE day =?', [getCorrectDay()], function(err,row){     //db.each() is only one which is funtioning while reading data from the DB
      if(err){
        res.send("Error encountered while displaying");
        return console.error(err.message);
      }
      
      var user ={
          us: row.US,
          time: row.TIME
        }; // will have a problem if there are multiple classes in one day with the same username
        runBotty(user);
      //console.log(usernames);
    });
  });



/**
 * 
 * @param {*} user 
 * username
 * time
 */
  function runBotty(user){
      console.log("Im here:)")
      var time = user.time.split(":");
      var millisTillClass = new Date(now.getFullYear(), now.getMonth(), now.getDate(), time[0], time[1], 0, 0) - now;
      console.log("mill: " + millisTillClass);
      setTimeout(function(){
        console.log("Its time to sign up for class :)");
        
        //calling botty:)
        db.serialize(()=>{
            db.each('SELECT username US, password PS, day DAY , time TIME, instructor INS FROM emp WHERE username =? AND time =? ', [user.us, user.time], function(err,row){     //db.each() is only one which is funtioning while reading data from the DB
                if(err){
                  return console.error(err.message);
                }
                console.log(row.US + " " + row.PS + " " + row.TIME);
                //bot(row.US, row.PS, row.DAY, row.TIME, row.INS);
             
              //$.getScript("botty.js" , function(){

              //});
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