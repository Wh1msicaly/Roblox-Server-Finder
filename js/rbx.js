// ==UserScript==
// @name         Roblox Server Finder
// @version      0.400.5
// @description  One of the most complex Server Finders! A Server finder that allows you to specify, amount of players. Uses a quick-search algorithm to find servers as quick as possible.Better for finding servers that are more than 0.
// @match        https://www.roblox.com/games/*
// @grant        none
// @namespace https://greasyfork.org/users/804801
// ==/UserScript==

(function () {
    Math.randomseed
    // Gets the game ID
    const gid = Number(window.location.pathname.split("/")[2]);
    const PlaceID = location.href.match(/\/(\d+)\//g);
    if (!gid) return;
    // Gets the game URL
    const url = `https://www.roblox.com/games/${gid}`;
    let hints = ["* Players may join as your are connecting, search for slightly smaller.",
                 "* Quick search, skips to the end good for finding small or empty servers.",
                 "* Smart search, goes inbetween pages to find the closest playercount."];
    let hintText = hints[0];
    let searchTotal = 0;
    let searchDidFlip = [false,false];
    let searchPageMemory = [0,0];
    let searchRateMemory = [0,0];
    let searchRateCount = 0;
    let searchRateDef = 0;
    let searchRate = 0;
    let searchRateRepMax = 20;
    let searchRateSingleMax = 5;
    let searchFlipCount = 0;
    let searchFlipMax = 5;
    let searchSamePageCount = 0;
    let searchSamePageMax = 7;
    let searchSamePageMaxQuick = 12;
    let serachRatePercent = 0.1;//0.08
    let searchCapacity = 0;
    let searchExpandCount = 0;
    let searchExpandCountLimit = 2;
    let currentsearch = 0;
    //
    //   This is only for devolopment.
    //
    // uuid really has no value.
    let addUUID = false;
    // Fetch roblox's servers
    fetch(`https://www.roblox.com/games/getgameinstancesjson?placeId=${gid}&startindex=${0}`)
    // Turn the response into JSON
        .then((resp) => resp.json())
        .then(function (data) {
        searchTotal = data.TotalCollectionSize
        searchCapacity = (data.Collection[0].Capacity*1)
        updateCapacity();
        searchRate = Math.round(data.TotalCollectionSize*serachRatePercent)+1;
        searchRateDef = Math.round(data.TotalCollectionSize*serachRatePercent)+1;
    });
    // subset of searchtotal

    const cap = function(n,c1,c2)
    {
        if (n < c1)
        {
            return c1;
        }
        if (n > c2)
        {
            return c2;
        }
        return n
    }
    const fill = function(str,max,cap,fstr)
    {
        if(typeof(str) != "string") {str = str.toString()}
        if(typeof(max) == "string") {max = max.length}
        if(fstr==undefined) fstr = "⠀";
        if(cap==undefined) {cap=true}
        if(str.length > max && cap)
        {
            return str.substring(1,max)
        }
        if(str.length < max)
        {
            return str + fstr.repeat(max-str.length)
        }
        if (str.length == max)
        {
            return str;
        }
    }
    const constructJoinScript = function(placeID,UUID)
    {
        return "Roblox.GameLauncher.joinGameInstance(" + placeID + ",\"" + UUID + "\")";
    }
    const getRandomInt = function(max) {
        return Math.floor(Math.random() * max);
    }
    const returnVisibleBool = function(bool) {
        var defs = ['visible','hidden'];
        if (bool) {return defs[0]}else{return defs[1]}
    }
    const expandSearch = function()
    {
        searchCountRange[0] = cap(Number(searchCountRange[0])-1,1,searchCapacity)
        searchCountRange[1] = cap(Number(searchCountRange[1])+1,1,searchCapacity)
        searchExpandCount +=1;
    }
    const setRandomHintStatus = function()
    {
        hintText = hints[getRandomInt(2)]
    }
    const updateStatus = function(search,page,closematch)
    {
        if (typeof(closematch) == "number" || typeof(closematch) == "string") {}else{
            closematch = "*";
        }

        status_label.innerHTML = "Range : " + searchCountRange[0] + "-" + searchCountRange[1] + " | Target : " + currentsearch + " | Closest Match : " + closematch +" | Page : " + page + " / " + searchTotal + " | Rate : " + searchRate;
    }
    const setStatus = function(text)
    {
        status_label.innerHTML = text;
    }
    const updateCapacity = function()
    {
        if (searchCapacity != undefined){
            app.max = searchCapacity.toString();
            app.value = "0";
        }
    }
    const smartSearch = function (gid, min, max,search ) {
        if (!searchStatus) {
            setStatus(hintText)
            return
        }
        currentsearch = search;

        // Get the game page
        searchPageMemory[1] = searchPageMemory[0];
        var page = searchCountLoop;
        searchPageMemory[0] = page;
        if (searchBackwards) {
            searchCountLoop -=searchRate;
        }else{
            searchCountLoop +=searchRate;
        }
        if (searchExpandCount > searchExpandCountLimit)
        {
            searchExpandCount = 0;
            search = Math.floor((searchCountRange[0]+searchCountRange[1])/2);
            searchRate = (searchRateDef*1);
        }
        searchCountLoop = cap(searchCountLoop,0,1000000000);
        searchRateMemory[1] = cap(searchRate,1,1000000000)
        searchRate = cap(searchRate,1,1000000000);
        searchRateMemory[0] = cap(searchRate,1,1000000000)
        page = cap(page,0,1000000000);

        if (searchPageMemory[0] == searchPageMemory[1] )
        {
            searchSamePageCount += 1;
        }
        if (searchSamePageCount > searchSamePageMax)
        {
            searchSamePageCount = 0;
            updateStatus(search,page,close);
            expandSearch();
        }

        if (searchRateMemory[0] == 1 && searchRateMemory[1] == 1)
        {
            searchRateCount += 1;
        }
        if (searchRateCount > searchRateRepMax)
        {
            searchRateCount = 0;
            updateStatus(search,page,close);
            expandSearch();
        }

        // Fetch roblox's servers
        fetch(`https://www.roblox.com/games/getgameinstancesjson?placeId=${gid}&startindex=${page}`)
        // Turn the response into JSON
            .then((resp) => resp.json())
            .then(function (data) {

            let matchFound = false
            let matchNum = 0;
            let close = 0;
            let closeNum = 0;
            for(var i in data.Collection)
            {
                var tserver = data.Collection[i];
                close = tserver.CurrentPlayers.length;
                closeNum = i;

                if(tserver.CurrentPlayers.length >= searchCountRange[0] && tserver.CurrentPlayers.length <= searchCountRange[1])
                {
                    matchNum =i;
                    matchFound = true;
                }
            }
            searchDidFlip[0] = false
            var didFindDirection = false;
            if (close<search)
            {
                didFindDirection = true;
                searchRate = Math.round(searchRate * searchDecreaseRate);
                if (searchRate < searchRateSingleMax)
                {
                    searchRate = cap(searchRate - 1,1,10000000);
                }
                searchBackwards = true
                searchDidFlip[0] = true
            }
            if (close>search)
            {
                didFindDirection = false;
                searchBackwards =false
                searchDidFlip[0] = true
            }
            if(close==search)
            {
                searchRate = Math.round(searchRate * searchDecreaseRateWhenClose);
            }
            if (page>=searchTotal)
            {
                searchBackwards = true;
                searchRate = Math.round(searchRate * searchDecreaseRate);
            }
            if(searchDidFlip[0] == true && searchDidFlip[1] == false || searchDidFlip[0] == false && searchDidFlip[1] == true)
            {
                searchFlipCount +=1;
            }
            if (searchFlipCount > searchFlipMax)
            {
                updateStatus(search,page,close);
                searchFlipCount = 0;
                expandSearch();
            }
            searchDidFlip[1] = searchDidFlip[0]
            if (matchFound) {
                var server = data.Collection[matchNum];
                console.log(server)
                addToServerPanels(server);
                searchStatus = false
                showSearchButtons();
                setStatus(hintText)
                return true;
            } else if (data.Collection.length == 0) {
                max = page;
                updateStatus(search,page,close);
                smartSearch(gid, min, max,search);
            } else {
                min = page;
                updateStatus(search,page,close);
                smartSearch(gid, min, max,search);
            }
        });
    };

    const quickSearch = function (gid, min, max,search ) {
        if (!searchStatus) {
            setStatus(hintText)
            return
        }
        currentsearch = search;

        // Get the game page
        searchPageMemory[1] = searchPageMemory[0];
        var page = Math.round((max + min) / 2);
        searchPageMemory[0] = page;
        if (searchPageMemory[0] == searchPageMemory[1] )
        {
            searchSamePageCount += 1;
        }
        if (searchSamePageCount > searchSamePageMaxQuick)
        {
            setStatus(hintText);
            searchStatus = false
            showSearchButtons();
            alert("Quick Search could not find a server, with " + search + " Players. Try again later");
            return true;
        }

        // Fetch roblox's servers
        fetch(`https://www.roblox.com/games/getgameinstancesjson?placeId=${gid}&startindex=${page}`)
        // Turn the response into JSON
            .then((resp) => resp.json())
            .then(function (data) {
            let matchFound = false
            let matchNum = 0;
            let close = 0;
            for(var i in data.Collection)
            {
                var tserver = data.Collection[i];

                close = tserver.CurrentPlayers.length
                if(tserver.CurrentPlayers.length == search)
                {
                    matchNum = i;
                    matchFound = true;
                }
            }
            if (matchFound) {
                var server = data.Collection[matchNum];
                addToServerPanels(server);
                setStatus(hintText)
                searchStatus = false
                showSearchButtons();
                return true;
            } else if (data.Collection.length == 0) {
                max = page;
                updateStatus(search,page,close);

                quickSearch(gid, min, max,search);
            } else {
                min = page;
                updateStatus(search,page,close);


                quickSearch(gid, min, max,search);
            }
        });
    };
    const hideSearchButtons = function() {
        var buttons = searchButtons
        for (var i in buttons)
        {
            var button = buttons[i];
            button.style.display = "none";
        }
        stop_btn.style.display = displayType
    }
    const showSearchButtons = function() {
        setRandomHintStatus();

        var buttons = searchButtons
        for (var i in buttons)
        {
            var button = buttons[i];
            button.style.display = displayType;
        }
        stop_btn.style.display = "none"
    }
    let searchStatus = false;
    let searchCount = 0;
    let searchCountRange = [0,0];
    let searchCountLoop = 0;
    let searchDecreaseRate = 0.8;
    let searchDecreaseRateWhenClose = 0.99999999999985;
    let searchBackwards = false;
    let displayType = "inline";
    let serverPanels = [];
    const resetParam = function()
    {

        searchRate = (searchRateDef*1);
        searchCountLoop = 0;
        searchPageMemory = [0,0];
        searchBackwards = false;
        searchFlipCount = 0;
        searchDidFlip = [false,false];
        searchCountRange = [searchCount,searchCount]
        searchSamePageCount = 0;
        searchExpandCount = 0;
    }

    let h3ader = document.createElement("h3");
    h3ader.innerHTML = "Server Finder";
    let text_label = document.createElement("div")
    text_label.innerHTML = "Search Player Count | 0 "
    text_label.className = "text-label font-subheader-1 ng-binding"
    let stext_label = document.createElement("div")
    stext_label.innerHTML = "The amount of players you want to search for."
    stext_label.className = "scale-label font-body ng-binding"
    let hr = document.createElement("hr")
    let br = document.createElement("br")
    let status_label = document.createElement("p")
    status_label.innerHTML = hintText
    status_label.style.paddingTop = '1em'
    status_label.style.marginBottom = '1em'


    let app = document.createElement("input")
    app.type = "range"
    app.width = "150"
    app.min = "0";
    app.max = searchCapacity.toString();
    app.value = "0";
    app.step = "1";
    app.oninput = function () {
        searchCount = this.value;
        text_label.innerHTML ="Search Player Count | " + this.value.toString()
    };


    let btn = document.createElement("span");
    btn.onclick = function () {
        hideSearchButtons()
        resetParam()
        searchStatus = true
        quickSearch(gid, 0, searchTotal,searchCount);
    };
    btn.innerHTML = "Quick Search";
    btn.className = "btn-secondary-md";
    btn.style.display = displayType;

    let btn2 = document.createElement("span");
    btn2.onclick = function () {
        hideSearchButtons()
        resetParam()
        searchStatus = true
        searchCountRange = [searchCount,searchCount];
        let estami = Math.floor(Math.abs(1-(searchCount/searchCapacity))*searchTotal)
        searchCountLoop = estami;
        smartSearch(gid, estami, 10000,searchCount);
    };
    btn2.innerHTML = "Smart Search";
    btn2.className = "btn-secondary-md";
    btn2.style.display = displayType;

    // <div class="rbx-running-games-footer">
    //<button type="button" class="btn-control-sm btn-full-width rbx-running-games-load-more">Load More</button>
    // </div>
    let footer = document.createElement("span");
    footer.className = "rbx-running-games-footer"
    let clearbutton = document.createElement("button");
    clearbutton.className = "btn-control-sm btn-full-width"
    clearbutton.type = "button";
    clearbutton.innerHTML = "Clear All";
    clearbutton.style.visibility = "hidden";
    footer.append(clearbutton);
    clearbutton.onclick = function()
    {
        playerserverbox.innerHTML = "";
        serverPanels = [];
        spacer.innerHTML = "No Servers Found";
        clearbutton.style.visibility = "hidden";
    }

    let stop_btn = document.createElement("span");
    stop_btn.style.display = "none"
    stop_btn.onclick = function () {
        searchStatus = false
        resetParam()
        showSearchButtons();
        setStatus(hintText)
    };
    stop_btn.innerHTML = "Stop Searching";
    stop_btn.className = "btn-secondary-md";

    const createAvatar = function(url)
    {
        var avatarHolder = document.createElement("span");
        avatarHolder.className = "avatar avatar-headshot-sm player-avatar";
        //
        var avatarLink = document.createElement("a");
        avatarLink.className = "avatar-card-link";
        //
        var avatarImage = document.createElement("img");
        avatarImage.className = "avatar-card-image";
        avatarImage.src = url;
        //
        avatarLink.append(avatarImage);
        avatarHolder.append(avatarLink);
        //
        return avatarHolder;
    }
    const makeServerItem = function(id)
    {
        var item = document.createElement("li");
        item.className = "stack-row rbx-game-server-item";
        var sectionheader = document.createElement("div")
        sectionheader.className = "section-header";

        var linkmenu = document.createElement("div");
        linkmenu.className = "link-menu rbx-game-server-menu";

        var details = document.createElement("div");
        details.className = "section-left rbx-game-server-details";

        var label = document.createElement("div");
        label.className = "text-info rbx-game-status rbx-game-server-status";
        label.innerHTML = "11 of 12 people max";
        label.id = id + "playerLabel";

        var label2 = document.createElement("div");
        label2.className = "text-info rbx-game-status rbx-game-server-status";
        label2.innerHTML = "UUID:192892178-21818912";
        label2.id = id + "playerLabel2";
        label2.style.fontSize = "0.6em";
        label2.style.color = "#FFFFFF";
        label2.style.position = "absolute";

        var joinbtn = document.createElement("a");
        joinbtn.className = "btn-full-width btn-control-xs rbx-game-server-join";
        joinbtn.innerHTML = "Join";
        joinbtn.id = id + "joinButton";

        var players = document.createElement("div");
        players.className = "section-right rbx-game-server-players";
        players.id = id + "playerContainer";


        details.append(label);
        details.append(joinbtn);
        if (addUUID){
            details.append(label2);
        }

        sectionheader.append(linkmenu);

        item.append(sectionheader);
        item.append(details);
        item.append(players);
        return item;
    }
    let stackholder = document.createElement("div");
    stackholder.className = "stack";
    stackholder["data-maximumrows"] = "10";

    let playerserverbox = document.createElement("ul");
    playerserverbox.className = "section rbx-game-server-item-container stack-list";

    stackholder.append(playerserverbox);
    let spacer = document.createElement("p");
    spacer.className= "section-content-off";
    spacer.innerHTML = "No Servers Found.";


    const addToServerPanels = function(server)
    {
        spacer.innerHTML = "";
        clearbutton.style.visibility = "visible";
        var serverCount = 0;
        for (let i = 0; i < serverPanels.length; i++) {
            var panel = serverPanels[i]
            if (panel.id == server.Guid + (serverCount).toString())
            {
                serverCount += 1;
                console.log("Found Match Of Server Instance.");
            }
        }
        var id = server.Guid + (serverCount).toString();
        var serverPanel = {
            id   : id,
            server : server,
            item : {},
        };
        var item = makeServerItem(id);

        playerserverbox.prepend(item);

        // set item
        serverPanel.item =item;

        serverPanels.length[serverPanels.length] = serverPanel;
        //
        document.getElementById(id + "playerLabel").innerHTML = server.PlayersCapacity;
        if (addUUID) {
            document.getElementById(id + "playerLabel2").innerHTML = "UUID :" + id;
        }

        for (let i = 0; i < server.CurrentPlayers.length; i++) {
            var player = server.CurrentPlayers[i]
            var playerImageURL = player.Thumbnail.Url;
            document.getElementById(id + "playerContainer").append(createAvatar(playerImageURL));
        }
        // OLD SAVED
        var button = document.getElementById(id + "joinButton");
        //button.setAttribute("onclick",constructJoinScript(gid,id));
        // EVAL

        document.getElementById(id + "joinButton").onclick = function() {
            try {
                console.log(server.JoinScript);
                console.log(">>> " + gid + " " + server.Guid);
                // NON EVAL CHROME CONTEN POLICY CONFORMANT.
                Roblox.GameLauncher.joinGameInstance(gid, String(server.Guid));
            } catch (e) {
                console.log("Error:", e);
            }
        }
        //
        serverPanels.push(serverPanel);


    }
    // construction <>
    document.getElementById("game-instances").prepend(spacer);
    document.getElementById("game-instances").prepend(footer);
    document.getElementById("game-instances").prepend(stackholder);
    document.getElementById("game-instances").prepend(status_label);
    document.getElementById("game-instances").prepend(br);
    document.getElementById("game-instances").prepend(br);
    document.getElementById("game-instances").prepend(stop_btn);
    document.getElementById("game-instances").prepend(btn);
    document.getElementById("game-instances").prepend(btn2);
    document.getElementById("game-instances").prepend(app);
    document.getElementById("game-instances").prepend(stext_label)
    document.getElementById("game-instances").prepend(text_label);
    document.getElementById("game-instances").prepend(h3ader);
    // construction <>




    let searchButtons = [btn,btn2];

})();
