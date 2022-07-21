const {Builder, Browser, By, Key, until, Capabilities} = require('selenium-webdriver');
const credentials = require('./credentials.json')
const load= new Capabilities();
load.setPageLoadStrategy("none");
let navPage=1;
let clickable=0;


(async () =>{
    let driver = await new Builder().withCapabilities(load).forBrowser(Browser.FIREFOX).build();
    try {
      await driver.navigate().to('https://www.linkedin.com/');
      await sleep (6000)
      await makeAuth(driver);
      await sleep (2000);
      console.log("==================================================================================================== \n Starting Linkedin bot service \n====================================================================================================")
      await sleep (2000);
      await search(driver);
      if(clickable > 0){
        console.log(`Success!!! Connected with ${clickable} people`)
      } else {
        console.log(`I can't connect with anyone \n --------------------------------------------------------------------------------\nShutting down service. Have a nice day!`)
      }
    }
    finally{
      await driver.quit();
    }
  })();
  
  function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function makeAuth(driver){
    
    const inputEmail = await driver.findElement(By.id('session_key'));
    if(!inputEmail) return;
    inputEmail.sendKeys(credentials.user);
    
    const inputPassword = await driver.findElement(By.id('session_password'));
    if(!inputPassword) return;
    inputPassword.sendKeys(credentials.pass);
   
    const clickLogin = await driver.findElements(By.className('sign-in-form__submit-button'));
    await clickLogin[0].click();
  }

  async function search(driver){
    const searchTerm = encodeURI('recursos humanos ti');
    let page = navPage;

    await driver.navigate().to('https://www.linkedin.com/search/results/people/?keywords='+searchTerm+'&origin=CLUSTER_EXPANSION&page='+page+'&sid=-wZ');
    await sleep(5000);
    
    const resultsPage = await driver.findElements(By.className('entity-result__actions'||'entity-result__divider'));
    const voidResults = await driver.findElements(By.className('entity-result__actions--empty'))
    clickable=resultsPage.length - voidResults.length;

    console.log(`Total de botões clicaveis são ${clickable}`)
    console.log(`Total de botões não clicaveis são ${voidResults.length}`)
    
    await sleep(4000)

    //A PARTIR DAQUI COMEÇA A PESQUISA
    for(let cont=0; cont < clickable; cont++){
       const result = resultsPage[cont];
       const buttonConnection = await result.findElements(By.className('artdeco-button'));
       if(!buttonConnection.length) continue;
       const buttonText = await buttonConnection[0].getAttribute('innerHTML')
       if(buttonText.includes('Seguir'||'Enviar mensagem')||buttonText==undefined) continue;
       
       await buttonConnection[0].click();
       await sleep(2000);
       
       
       const modal = await driver.findElements(By.className('send-invite'));
       if (!modal.length) continue;
       
       const buttonModal = await modal[0].findElements(By.tagName('button'));
       if(!buttonModal.length) continue;
       
       for (let i=0; i< buttonModal.length; i++) {
         const button = buttonModal[i];
         const textButton = await button.getAttribute('innerHTML');
         if(textButton.includes('Adicionar nota')){
           await button.click();
           break;
         }
       }
       
       await sleep(2000);
       const elementMessage = await modal[0].findElement(By.id('custom-message'));
       if(!elementMessage) continue;
       elementMessage.sendKeys('Olá, sou Alecsander faço parte do DevPlay onde estou aprendendo a desenvolver sistemas. Esta mensagem foi enviada por um robô criado por mim para me auxiliar no contato com recrutadores e demonstrar um pouco do que aprendi! Veja mais sobre mim no meu GitHub: https://github.com/AlecsanderSn')
       await sleep(6000);
       const confirmMessage = await modal[0].findElements(By.className('artdeco-button'||'artdeco-button--2'||'artdeco-button--primary'));
       if (!confirmMessage.length) continue;
       await confirmMessage[0].click();
       await sleep(5000)     
       
      }
      
      navPage++
      console.log(navPage)
      if(navPage < 2){
          await search(driver)
      }
  }