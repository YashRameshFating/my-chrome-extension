//mutation observer to detect when the email reply box is added to the DOM
console.log("content.js loaded");

function createAiButton(){
    const button=document.createElement('div');
    button.className='T-I J-J5-Ji aoO v7 T-I-atl L3';
    button.style.marginRight='8px';
    button.innerText='AI Reply';
    button.setAttribute('role','button');
    button.setAttribute('data-tooltip','Generate AI Reply');
    return button;
    
}
function getEmailContent(){
    //gmail compose window has two toolbars one is for formatting options and the other is for adding attachments and other options. we are targeting the second toolbar which has the class name "aDh" or "btC" or role="dialog". we are using querySelector to find the toolbar element in the DOM.
    const selectors=[
      '.h7',
      '.a3s.aiL',
      '.gmail_quote',
      '[role="presentation"]'
    ];

    for(const selector of selectors){
        const content=document.querySelector(selector);
        if(content){
          return content.innerText.trim();
        }
       
    }
    return '';
}



function findComposeToolbar(){
    //gmail compose window has two toolbars one is for formatting options and the other is for adding attachments and other options. we are targeting the second toolbar which has the class name "aDh" or "btC" or role="dialog". we are using querySelector to find the toolbar element in the DOM.
    const selectors=[
      '.btC',
      '.aDh',
      '[role="toolbar"]',
      '.gU.Up'
    ];

    for(const selector of selectors){
        const toolbar=document.querySelector(selector);
        if(toolbar){
          return toolbar;
        }
       
    }
 return null;
}


function injectButton(){

    const existingButton=document.querySelector(".ai-reply-button");
    if(existingButton){
      existingButton.remove();
    }

    const toolbar=findComposeToolbar();
    if(!toolbar){
      console.log("Toolbar found:");
      return;
    }
    console.log("Toolbar found,creating Ai Reply Button");

    const button=createAiButton();
    button.classList.add("ai-reply-button");

    button.addEventListener("click",async()=>{
         try{
           button.innerText="Generating...";
           button.disabled=true;

           const emailContent=getEmailContent();

         const response=  await fetch(
              "https://email-writer-r683.onrender.com/api/email/generate",
              {
                method: "POST",
                mode: "cors",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  emailContent,
                  tone: "formal"
                })
              }
            )
          if(!response.ok){
            throw new Error(`HTTP error! status: ${response.status}`);
          }

           const generatedReply= await response.text();
           const composeBox=document.querySelector('[role="textbox"][g_editable="true"]');

           if(composeBox){

            composeBox.focus();

            //execCommand is a method that allows us to execute commands on the document, such as inserting text, formatting text, or manipulating the selection. in this case, we are using execCommand to insert the generated AI reply into the compose box. we are passing three arguments to execCommand: the command name ('insertText'), a boolean value indicating whether to show the default UI (false), and the text to be inserted (generatedReply).
            document.execCommand('insertText',false,generatedReply);
           }
           else{
            console.error("Compose box not found");
           }

         }catch(error){
          console.error(error);
          alert("Failed to generate AI reply. Please try again later.");
         }finally{
          button.innerText="AI Reply";
          button.disabled=false;
         }
    })

    toolbar.insertBefore(button,toolbar.firstChild);
}


//creating the new instance of mutation observer and passing a callback function that will be executed whenever mutations are observed


//what is mutation observer? 
//ans-it is a browser api that watches for chnages in the dom and executes a callback function when those changes are detected. it is used to monitor changes to the dom tree, such as when elements are added, removed, or modified. this allows developers to react to changes in the dom and update the user interface accordingly. in this case, we are using mutation observer to detect when the email reply box is added to the dom and then inject our custom button into it.

//(mutation) is a callback which is giving us the list of mutations  and we are iterating over each mutation to check if any of the added nodes match the selector for the email compose box. if a match is found, we log a message to the console and call the injectButton function after a short delay.

const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          //mutation has a property called addedNodes .addednodes is the property that contians a list of nodes that have been added to the DOM as part of the mutation. we are converting it into an array using Array.from() method so that we can use array methods like some() to check if any of the added nodes match the selector for the email compose box.

           const addedNodes=Array.from(mutation.addedNodes);

            const hasComposeElements = addedNodes.some(node => {
                if (!(node instanceof Element)) {
                    return false;
                }

                return (
                    node.matches('.aDh, .btC, [role="dialog"]') ||
                    node.querySelector('.aDh, .btC, [role="dialog"]')
                );
            });
                //.aDh , .btC,[role="dialog"] are the  (gmail compose window selector)selectors for the email compose box. we are checking if any of the added nodes match these selectors using the matches() method or if any of the added nodes contain a child element that matches these selectors using querySelector() method.
              

                  //if the conditon is true we are calling the injectButton function after a short delay of 500 milliseconds(half a second) using setTimeout() method. this is done to ensure that the email compose box is fully loaded before we try to inject our custom button into it.

           if(hasComposeElements){
                console.log("Compose Window  detected"); 
                setTimeout((injectButton), 500);
        
           }


        }
});


//we are starting the mutation observer to watch for changes in the DOM. we are observing the document.body element and specifying that we want to watch for changes to the child list and subtree of the observed node. this means that the observer will be triggered whenever a new element is added to the body or any of its descendants, which allows us to detect when the email compose box is added to the DOM.
observer.observe(document.body, { 
  childList: true,//watches for addition or removal of child items to the observed node
  subtree: true //watches for changes to all descendants of the observed node, not just direct children
});