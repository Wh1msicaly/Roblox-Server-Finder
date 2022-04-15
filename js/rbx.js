// Plugin Related functions 
(function () {
    //
    const Difference = function (a, b) { return Math.abs(a - b); }
    const IsIterable = function (obj) {if (obj == null) {return false;}return typeof obj[Symbol.iterator] === 'function';}
    const GetRandomInt = function(max) { return Math.floor(Math.random() * max) }
    const Range = function(n,c1,c2){if (n < c1){return c1;}if (n > c2){return c2;}return n}
        
    const ProvideCredintials = { credentials: "include" }
    // Gets the PlaceID/UniverseID
    const PlaceID = Number(window.location.pathname.split("/")[2]);
    // Gets the game URL
    const Url = `https://www.roblox.com/games/${PlaceID}`;
    // 
    var RobloxServerFinder = {
       ServerDetails : {
           SearchCapacity : 0,
           SearchSize : 100,
           ServerPanels : [],
       }, 
        
       Search : {
           TotalScanned : 0, 
           Direction : "next",
           LastDirection : "next",
           PlayerCount : 0,
           SearchRange : [0,0],
           CurrentCursor : "",
           LastClosestMatch : -10000,
           ClosestMatch : -10000,
           //
           ReadDirection : "Asc",
           // 
           SamePageCount : 0,
       },
       Flags : {
           AddUUID : false,
           
           
       },
        
       Hints : ["* Players may join as your are connecting, search for slightly smaller.",
                 "* You can change preferences about the plugin in the plugin interfrace..",
                 "* Smart search, goes inbetween pages to find the closest playercount."],
       //
       ConstructorArray : [],
        
       ElementConstructors : {},
        
       UrlGen : {},
        
       Elements : {},
        
       StylePacks : {
           InLineDisplay : {
               display : "inline"
           },
           Invisible : {
               display : "none"
           }
       },
        
       Enabled : true
    };
    // Easy Construciton of Elements.
    RobloxServerFinder.Apply = function(Element,Properties,Style) {
        for(const Key in Properties){ const Value = Properties[Key];
            Element.setAttribute(Key,Value);
        }
        for(const Key in Style){ const Value = Style[Key];
            Element.style[Key] = Value;
        }
    }
    RobloxServerFinder.Construct = function(Element,Properties,Style) {
        let DocElement = document.createElement(Element); 
  
        for(const Key in Properties){ const Value = Properties[Key]; 
            DocElement[Key] = Value;
        }
        for(const Key in Style){ const Value = Style[Key]; 
            DocElement.style[Key] = Value;
        }
        
        return DocElement
    }   
    
    
     RobloxServerFinder.Elements.ClearButton = RobloxServerFinder.Construct("button",{
         className : "btn-control-sm btn-full-width",
         type : "button",
         textContent : "Clear All",
     
     },RobloxServerFinder.StylePacks.Invisible);
    
    
    RobloxServerFinder.Elements.QuickSearchButton = RobloxServerFinder.Construct("span",{
        textContent : "Quick Search",
        className : "btn-secondary-md",
        style : {
            display : "none"
        }
    },RobloxServerFinder.StylePacks.Invisible);
    
    RobloxServerFinder.Elements.SmartSearchButton = RobloxServerFinder.Construct("span",{
        textContent : "Smart Search",
        className : "btn-secondary-md",
        style : {
            display : "inline"
        }
    },RobloxServerFinder.StylePacks.InLineDisplay);
    
    RobloxServerFinder.Elements.CancelButton = RobloxServerFinder.Construct("span",{
        textContent : "Stop Searching",
        className : "btn-secondary-md",
        style : {
            display : "none"
        }
    },RobloxServerFinder.StylePacks.Invisible);
    
    
    
    RobloxServerFinder.Elements.Footer = RobloxServerFinder.Construct("span",{
         className : "rbx-running-games-footer",
    });
    RobloxServerFinder.Elements.MainText = RobloxServerFinder.Construct("div",{
        textContent : "Search Player Count | 0 ",
        className : "text-label font-subheader-1 ng-binding", 
 
    });
    RobloxServerFinder.Elements.SubMainText = RobloxServerFinder.Construct("div",{
        textContent : "The amount of players you want to search for.",
        className : "scale-label font-body ng-binding"
    });
    RobloxServerFinder.Elements.Spacer = RobloxServerFinder.Construct("p",{
        className : "section-content-off",
        textContent : "No Servers Found."
    });
    RobloxServerFinder.Elements.Slider = RobloxServerFinder.Construct("input",{
         type : "range",
         width : "150",
         min : "0",
         max : "0",
         value : "0",
         step : "1"
    });
    RobloxServerFinder.Elements.Header = RobloxServerFinder.Construct("h3",{
        textContent : "Server Finder"
    });
    
    RobloxServerFinder.Elements.NewLine = RobloxServerFinder.Construct("br");
   
    RobloxServerFinder.Elements.StatusLabel = RobloxServerFinder.Construct("p",{
        textContent : "THIS IS A HINTTEXT"
    },{
        paddingTop : '1em',
        marginBottom : '1em'
    });
    
    // PlayerServerBox ( in the stackholder) 
    RobloxServerFinder.Elements.PlayerServerBox = RobloxServerFinder.Construct("ul",{
        className : "section rbx-game-server-item-container stack-list"
    })
    
    RobloxServerFinder.Elements.StackHolder = RobloxServerFinder.Construct("div",{
        className : "stack",
        "data-maximumrows" : "10"
    });
    
    // Make amendments
   RobloxServerFinder.Elements.StackHolder.append(RobloxServerFinder.Elements.PlayerServerBox)
    
    // Element Updators 
   RobloxServerFinder.UpdateStatusText = function()
   {
       
       let CloseMatch = RobloxServerFinder.Search.ClosestMatch 
       
       if (CloseMatch == -10000) {
           CloseMatch = "Finding a Server..."
       }
       
       RobloxServerFinder.Elements.StatusLabel.textContent = "Range : " + RobloxServerFinder.Search.SearchRange[0] + "-" + RobloxServerFinder.Search.SearchRange[1] + " | Target : " + RobloxServerFinder.Search.PlayerCount + " | Closest Match : " + CloseMatch +" | Scanned : " + RobloxServerFinder.Search.TotalScanned + " servers. | Rate : " + RobloxServerFinder.ServerDetails.SearchSize;
   }
   RobloxServerFinder.setRandomHintStatus = function()
   {
       RobloxServerFinder.Elements.StatusLabel.textContent = RobloxServerFinder.Hints[GetRandomInt(2)];
   }
    
    // Construction Functions 
    
    RobloxServerFinder.ElementConstructors.ConstructAvatar = function(Url) {
        let AvatarHolder = RobloxServerFinder.Construct("span",{className : "avatar avatar-headshot-sm player-avatar"});
        let AvatarLink = RobloxServerFinder.Construct("a",{className : "avatar-card-link"});
        let AvatarImage = RobloxServerFinder.Construct("img",{
            className : "avatar-card-image",
            src : Url
        });
        //
        AvatarLink.append(AvatarImage);
        AvatarHolder.append(AvatarLink);
        return AvatarHolder;
    }
    
    RobloxServerFinder.ElementConstructors.MakeServerPanel = function(Identifer){
        let Item = RobloxServerFinder.Construct("li",{className : "stack-row rbx-game-server-item"});
        let Sectionheader = RobloxServerFinder.Construct("div",{className:"section-header"});
        let Linkmenu = RobloxServerFinder.Construct("div",{className : "link-menu rbx-game-server-menu"});
        let Details = RobloxServerFinder.Construct("div",{className : "section-left rbx-game-server-details"});
        let Label = RobloxServerFinder.Construct("div",{
            className : "text-info rbx-game-status rbx-game-server-status",
            textContent : "<ServerPanel.Label>:ID->playerLabel",
            id : Identifer + "playerLabel"
        
        });
        let Label2 = RobloxServerFinder.Construct("div",{
            className : "text-info rbx-game-status rbx-game-server-status",
            textContent : "<RobloxServerFinder.Flags.AddUUID>",
            id : Identifer + "playerLabel2"
        },{
            fontSize : "0.6em",
            color : "#FFFFFF",
            position : "absolute"
        });
        let Joinbtn = RobloxServerFinder.Construct("a",{
            className : "btn-full-width btn-control-xs rbx-game-server-join",
            textContent : "Join",
            id : Identifer + "joinButton"
        });
        let Players = RobloxServerFinder.Construct("div",{
            className : "section-right rbx-game-server-players",
            id : Identifer + "playerContainer"
        });

        Details.append(Label);
        Details.append(Joinbtn);
        if (RobloxServerFinder.Flags.AddUUID){
            Details.append(Label2);
        }
        // Bind SectionHeader
        Sectionheader.append(Linkmenu);
        // Item Amendments.
        Item.append(Sectionheader);
        Item.append(Details);
        Item.append(Players);
        return Item;
    }
    
    //&cursor=23f32f23f23f2f3
    RobloxServerFinder.UrlGen.GenerateFindWithOnlyLimit = function(sortOrder,Limit){
     //https://games.roblox.com/v1/games/%206284583030/servers/Public?limit=10
      return `https://games.roblox.com/v1/games/${PlaceID}/servers/public?sortOrder=${sortOrder}&limit=${Limit}`
    }
    
    // ServerFinding Functions 
    RobloxServerFinder.UrlGen.GenerateFindWithCursorAndLimit = function(sortOrder,Limit,Cursor){
     //https://games.roblox.com/v1/games/%206284583030/servers/Public?limit=10
      return `https://games.roblox.com/v1/games/${PlaceID}/servers/public?sortOrder=${sortOrder}&limit=${Limit}&cursor=${Cursor}`
    }
    RobloxServerFinder.UrlGen.GenerateFind = function(sortOrder="Asc",Limit=10,Cursor){
        if(Cursor == undefined){
            return RobloxServerFinder.UrlGen.GenerateFindWithOnlyLimit(sortOrder,Limit)
        }else{
            return RobloxServerFinder.UrlGen.GenerateFindWithCursorAndLimit(sortOrder,Limit,Cursor);
        }
    }
    
    RobloxServerFinder.Validate = function(Response) {
        return true 
    }
    
    
    
    
    RobloxServerFinder.AddToServerPanels = function(Server)
    {
        RobloxServerFinder.Elements.Spacer.textContent = "";
        let serverCount = 0;
        for (let i = 0; i < RobloxServerFinder.ServerDetails.ServerPanels.length; i++) {
            let Panel = RobloxServerFinder.ServerDetails.ServerPanels[i]
            if (Panel.id == Server.id + (serverCount).toString())
            {
                serverCount += 1;
            }
        }
        let Identifer = Server.Guid + (serverCount).toString();
        let ServerPanel = {
            id   : Identifer,
            server : Server,
            item : {},
        };
        let Item = RobloxServerFinder.ElementConstructors.MakeServerPanel(Identifer);

        RobloxServerFinder.Elements.PlayerServerBox.prepend(Item);

        // set item
        ServerPanel.item =Item;

        RobloxServerFinder.ServerDetails.ServerPanels.length[RobloxServerFinder.ServerDetails.ServerPanels.length] = ServerPanel;
        //
        document.getElementById(Identifer + "playerLabel").textContent = Server.playing + " of " + Server.maxPlayers + " people max";
        if (RobloxServerFinder.Flags.AddUUID) {
            document.getElementById(Identifer + "playerLabel2").textContent = "UUID :" + Identifer;
        }

        for (let i = 0; i < Server.playing; i++) {
            var PlayerImageURL = "https://raw.githubusercontent.com/Wh1msicaly/web/master/Default.png"; // Dont as quickFix Replacement.
            document.getElementById(Identifer + "playerContainer").append(RobloxServerFinder.ElementConstructors.ConstructAvatar(PlayerImageURL));
        }
        
        // OLD SAVED
        let Button = document.getElementById(Identifer + "joinButton");

        document.getElementById(Identifer + "joinButton").onclick = function() {
            try {
                console.log(">>> " + PlaceID + " " + Server.id);
                // NON EVAL CHROME CONTEN POLICY CONFORMANT.
                
                Roblox.GameLauncher.joinGameInstance(PlaceID, String(Server.id));
            } catch (e) {
                console.log("Error:", e);
            }
        }
        //
        RobloxServerFinder.ServerDetails.ServerPanels.push(ServerPanel);
        
        // Apply Display to the clearbutton.
        RobloxServerFinder.Apply(RobloxServerFinder.Elements.ClearButton,{},RobloxServerFinder.StylePacks.InLineDisplay)
        RobloxServerFinder.SetButtonState('NormalButton')
        RobloxServerFinder.setRandomHintStatus();

    }
                                    
    RobloxServerFinder.Expand = function() {
        RobloxServerFinder.Search.SearchRange[0]= (RobloxServerFinder.Search.SearchRange[0]*1)-1;
        RobloxServerFinder.Search.SearchRange[1]= (RobloxServerFinder.Search.SearchRange[1]*1)+1;
        RobloxServerFinder.Search.SearchRange[0] = Range(RobloxServerFinder.Search.SearchRange[0]*1,0,1000000);
        RobloxServerFinder.Search.SearchRange[1] = Range(RobloxServerFinder.Search.SearchRange[1]*1,0,1000000);
    }
    
    
    RobloxServerFinder.LinearSearch = function() {
        
        //RobloxServerFinder.Search.PlayerCount
        fetch(RobloxServerFinder.UrlGen.GenerateFind(RobloxServerFinder.Search.ReadDirection,RobloxServerFinder.ServerDetails.SearchSize,RobloxServerFinder.Search.CurrentCursor),ProvideCredintials).then((resp) => resp.json()).then(function(Response){
            
            if (!RobloxServerFinder.Enabled) { return }
            
            // SaveLast 
            RobloxServerFinder.Search.LastClosestMatch = RobloxServerFinder.Search.ClosestMatch
            
            if ( RobloxServerFinder.Validate(Response) ) {
                let ServerList = Response.data;
                
                // If serverList is Invalid!
                if (!IsIterable(ServerList)) {
                    RobloxServerFinder.Elements.StatusLabel.textContent = "Waiting for Roblox to Renew Request.";
                    setTimeout(RobloxServerFinder.LinearSearch, 1000);
                    return;
                }
                
       
                for(const ServerObject of ServerList ) {
                    let PlayerCount = (ServerObject.playing*1)
                    let DistanceFromClosest = Difference(RobloxServerFinder.Search.ClosestMatch,RobloxServerFinder.Search.PlayerCount)
                    let DistanceFromCurrent = Difference(PlayerCount,RobloxServerFinder.Search.PlayerCount)
                    // if within Range
                    if ((PlayerCount*1) >= RobloxServerFinder.Search.SearchRange[0] && (PlayerCount*1) <= RobloxServerFinder.Search.SearchRange[1]){
                        console.warn("Found",ServerObject); 
                        RobloxServerFinder.AddToServerPanels(ServerObject);
                        return; 
                    }
                  
                    if (DistanceFromCurrent < DistanceFromClosest) {
                        RobloxServerFinder.Search.ClosestMatch = PlayerCount
                        RobloxServerFinder.Search.ClosestObject = ServerObject
                    } 
                    
                    RobloxServerFinder.Search.TotalScanned +=1; 
                }
                
                RobloxServerFinder.Search.LastDirection = RobloxServerFinder.Search.Direction;
                ( RobloxServerFinder.Search.LastClosestMatch == RobloxServerFinder.Search.ClosestMatch ) ? RobloxServerFinder.Search.SamePageCount+= 1 : RobloxServerFinder.Search.SamePageCount = 0; 
                
                if ( RobloxServerFinder.Search.ClosestMatch > RobloxServerFinder.Search.PlayerCount ) {
                    RobloxServerFinder.Search.Direction = "next"
                }
                if ( RobloxServerFinder.Search.ClosestMatch < RobloxServerFinder.Search.PlayerCount ) {
                    RobloxServerFinder.Search.Direction = "last"
                } 
                
                if ( RobloxServerFinder.Search.LastDirection != RobloxServerFinder.Search.Direction ) {
                    //RobloxServerFinder.Expand()
                }

                
                // Update Text
                console.warn(Response,RobloxServerFinder.Search.SamePageCount,RobloxServerFinder.Search.Direction)
                // Set the next one
                if (RobloxServerFinder.Search.ReadDirection == "Asc") {
                    if (RobloxServerFinder.Search.Direction == "next") {
                        RobloxServerFinder.Search.CurrentCursor = Response.previousPageCursor 
                    }
                    if (RobloxServerFinder.Search.Direction == "last") {
                         RobloxServerFinder.Search.CurrentCursor = Response.nextPageCursor 
                    }
                }else{
                    if (RobloxServerFinder.Search.Direction == "next") {
                        RobloxServerFinder.Search.CurrentCursor = Response.nextPageCursor 
                    }
                    if (RobloxServerFinder.Search.Direction == "last") {
                         RobloxServerFinder.Search.CurrentCursor = Response.previousPageCursor 
                    }
                }
                // Update foundings
                RobloxServerFinder.UpdateStatusText()
                // if the cursor is still undefined or then there is no cursor to be found. 
                if(RobloxServerFinder.Search.CurrentCursor == undefined) {
                    if (RobloxServerFinder.Search.ClosestObject == undefined) {
                        // Non Recoverable. 
                        RobloxServerFinder.Search.CurrentCursor = ""; 
                        RobloxServerFinder.LinearSearch();
                        return 
                    }
                    console.warn("All serveres exhausted here is the closest");
                    console.warn("Found",RobloxServerFinder.Search.ClosestObject); 
                    RobloxServerFinder.AddToServerPanels(RobloxServerFinder.Search.ClosestObject);
                    return; 
                }
                RobloxServerFinder.LinearSearch();
  
            }else{
                // Contuine Search if invalid
                RobloxServerFinder.LinearSearch();
            }
        }).catch((error) =>{
            console.warn("Actual Error catched");
            console.warn(error)
            RobloxServerFinder.Elements.StatusLabel.textContent = "Waiting for Roblox to Renew Request.";
            setTimeout(RobloxServerFinder.LinearSearch, 1000);
        });
    }
   
    
    
  
    // QuickSearchHasBeenDisabled.
    RobloxServerFinder.SetButtonState = function(state) {
        switch (state) {
            case 'NormalButton':
                RobloxServerFinder.Apply(RobloxServerFinder.Elements.QuickSearchButton,{},RobloxServerFinder.StylePacks.Invisible)
                RobloxServerFinder.Apply(RobloxServerFinder.Elements.SmartSearchButton,{},RobloxServerFinder.StylePacks.InLineDisplay)
                RobloxServerFinder.Apply(RobloxServerFinder.Elements.CancelButton,{},RobloxServerFinder.StylePacks.Invisible)
            break;
            case 'StopSearch':
                RobloxServerFinder.Apply(RobloxServerFinder.Elements.QuickSearchButton,{},RobloxServerFinder.StylePacks.Invisible)
                RobloxServerFinder.Apply(RobloxServerFinder.Elements.SmartSearchButton,{},RobloxServerFinder.StylePacks.Invisible)
                RobloxServerFinder.Apply(RobloxServerFinder.Elements.CancelButton,{},RobloxServerFinder.StylePacks.InLineDisplay)
            break;
        }
    }
    
    
    // Do some 
    RobloxServerFinder.InitServerData = function(callback){
        
        fetch(RobloxServerFinder.UrlGen.GenerateFind("Desc")).then((resp) => resp.json()).then(function(Response){
            if ( RobloxServerFinder.Validate(Response) ) {
                let ServerList = Response.data; 
                
                for(const ServerObject of ServerList ) {
                    //console.warn(ServerObject)
                    if( ServerObject.maxPlayers != undefined ) {
                        RobloxServerFinder.ServerDetails.SearchCapacity = ServerObject.maxPlayers
                        
                        callback()// LAZY PROMISE RESOLVER
                        break; 
                    }
                }
                
                console.warn(RobloxServerFinder.ServerDetails);
                
            }else{
                console.log("Invalid Response"); 
                callback()
            }
    
        });
    } 
    
    RobloxServerFinder.Init = function(callback){
        // Arrow 
        RobloxServerFinder.InitServerData(()=>{
            // Init UI 
            console.log(RobloxServerFinder.ServerDetails.SearchCapacity);
            RobloxServerFinder.Apply(RobloxServerFinder.Elements.Slider,{ max : RobloxServerFinder.ServerDetails.SearchCapacity })
            RobloxServerFinder.SetButtonState('NormalButton');
            
            console.log(" Initiliazed " );
            
            
        });
        
        /*cheap resolve===>*/callback();
        
        RobloxServerFinder.setRandomHintStatus();
  
    }
    
   //"none"
    
    RobloxServerFinder.Elements.Slider.oninput = function() {
        let Value = this.value;
        
        RobloxServerFinder.Search.PlayerCount = Value;
        RobloxServerFinder.Elements.MainText.textContent = "Search Player Count | " + Value.toString() 
    
    }
    //SearchRange
    RobloxServerFinder.Elements.SmartSearchButton.onclick = function() {
        RobloxServerFinder.Search.SearchRange = [RobloxServerFinder.Search.PlayerCount,RobloxServerFinder.Search.PlayerCount];
        RobloxServerFinder.Search.CurrentCursor = ""
        RobloxServerFinder.Search.ClosestMatch = -10000;
        RobloxServerFinder.Search.LastClosestMatch = -10000;
        RobloxServerFinder.Search.SamePageCount = 0;
        RobloxServerFinder.Search.ClosestObject = undefined; // Needs to be reset.TotalScanned
        RobloxServerFinder.Search.TotalScanned = 0;
        RobloxServerFinder.Search.Direction = "next"
        RobloxServerFinder.Search.LastDirection = "next"
        RobloxServerFinder.Enabled = true; 
        RobloxServerFinder.SetButtonState('StopSearch');
        RobloxServerFinder.Search.ReadDirection = "Desc" 
        
        // This really is the breaker or maker. You cant start in the middle : ( 
        if (RobloxServerFinder.Search.PlayerCount <= RobloxServerFinder.ServerDetails.SearchCapacity*0.6 ) {
          RobloxServerFinder.Search.ReadDirection = "Asc" 
        }
        
        RobloxServerFinder.LinearSearch()
    }
    
    RobloxServerFinder.Elements.CancelButton.onclick = function() {
        RobloxServerFinder.Enabled = false;
        // Apply Display to the clearbutton.
        RobloxServerFinder.SetButtonState('NormalButton')
        RobloxServerFinder.setRandomHintStatus()
    }
    
    RobloxServerFinder.Elements.ClearButton.onclick = function() {
        RobloxServerFinder.Elements.PlayerServerBox.textContent = "";
        RobloxServerFinder.ServerDetails.ServerPanels = [];
        RobloxServerFinder.Elements.Spacer.textContent = "No Servers Found.";
        RobloxServerFinder.Apply(RobloxServerFinder.Elements.ClearButton,{},RobloxServerFinder.StylePacks.Invisible)
    }
    
    // Do the Constructrion after intiliizing ( removed for now ) . . . 
    RobloxServerFinder.Init(() =>{
            // Constructor order 
        RobloxServerFinder.ConstructorArray.push(RobloxServerFinder.Elements.Header);
        RobloxServerFinder.ConstructorArray.push(RobloxServerFinder.Elements.MainText);
        RobloxServerFinder.ConstructorArray.push(RobloxServerFinder.Elements.SubMainText);
        RobloxServerFinder.ConstructorArray.push(RobloxServerFinder.Elements.Slider);
        // Buttons
        RobloxServerFinder.ConstructorArray.push(RobloxServerFinder.Elements.QuickSearchButton);
        RobloxServerFinder.ConstructorArray.push(RobloxServerFinder.Elements.SmartSearchButton);
        RobloxServerFinder.ConstructorArray.push(RobloxServerFinder.Elements.CancelButton);
        RobloxServerFinder.ConstructorArray.push(RobloxServerFinder.Elements.StatusLabel);
        //RobloxServerFinder.Elements.StatusLabel
   
        //
        RobloxServerFinder.ConstructorArray.push(RobloxServerFinder.Elements.StackHolder);
        RobloxServerFinder.ConstructorArray.push(RobloxServerFinder.Elements.ClearButton);
        
        // Space
        RobloxServerFinder.ConstructorArray.push(RobloxServerFinder.Elements.NewLine);
        RobloxServerFinder.ConstructorArray.push(RobloxServerFinder.Elements.NewLine);
    
        //RobloxServerFinder.ConstructorArray.push(RobloxServerFinder.Elements.NewLine);
        RobloxServerFinder.ConstructorArray.push(RobloxServerFinder.Elements.Footer);
        RobloxServerFinder.ConstructorArray.push(RobloxServerFinder.Elements.Spacer);
        //
        const GameInstances = document.getElementById("game-instances");
        // construction <>
        for (let Index=RobloxServerFinder.ConstructorArray.length; Index > 0;Index--) {
            let CurrentElement = RobloxServerFinder.ConstructorArray[Index-1]; GameInstances.prepend(CurrentElement);
        }
     
    });
    // Globalize
    window.RobloxServerFinder = RobloxServerFinder 
})();
