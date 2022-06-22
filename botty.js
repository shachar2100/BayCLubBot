/**
 * botty.js -> inspired by bayClub.js
 * Author: Shachar Habusha
 * Date: 1/17/2022
 */
 const User = {
    name:"",
    password: "",
    location : "East Bay",
    club: "Walnut Creek",
    timeRange: "Morning",
    category: "",
    innerCatrgory: "",
    weekday: 2,
    instructor:"Mike"
  };
//MIKE FRANZ 
 bot(User.name,User.password,"Sa","10:10", "PACO");
 console.log("8:30  - 9:00 AM".includes("8:30") )

function bot(username = "", password = "", day="Mo", startTime="", instructorName=""){
    console.log(username + " " + password + " " + day + " " + startTime + " " + instructorName );
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

        /**Find Day */
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
            //console.log("User input = " + userinput)
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


