;~function(){

    var d = document,
        scene = d.getElementById("scene"),
        startBtn = d.getElementById("start-btn"),
        timeBox = d.getElementById("time-box"),
        timeBar = d.getElementById("time-bar"),
        diffFindNum = d.getElementById("diff-find-num"),
        topPic = d.getElementById("top-pic"),
        bottomPic = d.getElementById("bottom-pic"),
        layer = d.getElementById("layer"), 
        mask = d.getElementById("mask"),  
        tipsWordArr = ["开始游戏吧！" , "玩累了，休息下吧！" , "时间到，游戏结束！每点错一次扣10s，你的得分是" , "恭喜全部通关！你的得分是"],
        imgNumArr = [],
        imgDiffNum = 0,
        imgFindNum = 0, 
        sceneSwitchTimer = null ,
        isPlayAgain = false,
        isFirstPlay = true; 

    startBtn.onclick = function(){
        if(isPlayAgain){
            game.init();
            counter.start(timeBar , true , game.over);
            sceneMask.hide();
        } 
        if(this.innerHTML == "开始游戏"){
            this.innerHTML = "暂停游戏";
            if(isPlayAgain){
                counter.start(timeBar , true , game.over);
            }
            else{
                counter.start(timeBar , false , game.over);
            }
            sceneMask.hide();
        }
        else{
            this.innerHTML = "开始游戏";
            counter.stop();
            sceneMask.show(tipsWordArr[1]);
        }
        isFirstPlay = false;
    }


    var game = {
        imgRender : function(){
            var self = this,
                randomNum = 0,
                imgNowNum = 0;        
            imgDiffNum = diffFindNum.innerHTML = 0;  // reset number of matching   
            topPic.innerHTML = bottomPic.innerHTML = ""; // clear scene content when start game or finished a scene
            if(imgNumArr.length){
                randomNum = Math.floor(Math.random()*imgNumArr.length); // get the random number of pic
                imgNowNum = imgNumArr[randomNum];  
                imgNumArr.splice(randomNum,1);
            }
            topPic.innerHTML = "<img src='images/"+ (imgData.imgInfo[imgNowNum].src) + "_a.jpg'><b class='pic-layer' id='top-pic-layer'></b>";
            bottomPic.innerHTML = "<img src='images/"+ (imgData.imgInfo[imgNowNum].src) + "_b.jpg'><b class='pic-layer' id='bottom-pic-layer'></b>";
            var topPicLayer = document.getElementById("top-pic-layer"),
                bottomPicLayer = document.getElementById("bottom-pic-layer");
            topPicLayer.onclick = bottomPicLayer.onclick = function(){
                counter.num -= 10;
            }
            for(var i = 0 ; i<4 ; i++){
                var diff = d.createElement("div"),
                    diffClone = null;
                diff.className = "diff";
                diff.setAttribute("index",i);
                diff.style["left"] = imgData.imgInfo[imgNowNum].pos[i].x + "px";
                diff.style["top"] = imgData.imgInfo[imgNowNum].pos[i].y + "px";
                diff.style["width"] = imgData.imgInfo[imgNowNum].pos[i].w + "px";
                diff.style["height"] = imgData.imgInfo[imgNowNum].pos[i].h + "px";
                diffClone = diff.cloneNode("deep");
                topPic.appendChild(diff);
                bottomPic.appendChild(diffClone);
                diffClone.onclick = diff.onclick = function(e){
                    var diffEle = scene.getElementsByTagName("div"),
                        thisIndex = this.getAttribute("index"),
                        e = e || event ;
                    for(var i = 0 ; i < diffEle.length ; i++){
                        if(diffEle[i].getAttribute("index") === thisIndex){
                            if(diffEle[i].className !== "diff selected"){
                                imgDiffNum++;
                                diffFindNum.innerHTML = imgDiffNum/2;
                                diffEle[i].className += " selected"
                            }   
                        }
                    }
                    if(imgDiffNum == 8){
                        if(imgNumArr.length ===  0){ // game pass
                            setTimeout(function(){
                                self.over(imgFindNum);
                            } , 800);
                        }
                        else{  // next pic
                            sceneSwitchTimer = setTimeout(function(){
                                self.imgRender();
                                counter.start(timeBar , true , self.over);
                            },800);
                            imgFindNum++;
                        }   
                    }
                    e.cancelBubble = true;
                }
            }
        },
        over : function(imgFindCount){
            if(imgFindCount === imgData.count - 1){ // you win
                sceneMask.show(tipsWordArr[3] + " " + (imgFindNum+1));
            }
            else{ // time is over
                sceneMask.show(tipsWordArr[2] + " " + imgFindNum);
            }   
            counter.stop(); 
            isPlayAgain = true;
            startBtn.innerHTML = "开始游戏";   
        },
        init : function(){
            isFirstPlay && sceneMask.show(tipsWordArr[0]);
            imgNumArr = [];
            for(var n = 0 ; n < imgData.count ; n++){
                imgNumArr.push(n);
            }   
            imgFindNum = 0;
            isPlayAgain = false;
            game.imgRender();
        }
    }

    var counter = {
        num : 60,
        maxW : timeBox.offsetWidth,
        timer : null,
        start : function(obj , isPlayAgain , callback){
            var self = this;  
            // reset timebar para when game init
            if(isPlayAgain){
                self.num = 60;  
                obj.style["width"] = self.maxW + "px";
            }
            clearInterval(self.timer);      
            self.timer = setInterval(function(){
                self.num--;
                if(self.num <= -1){
                    self.num = 0;
                    clearInterval(self.timer);
                    callback && callback();
                }
                obj.style["width"] = (self.num/60) * self.maxW + "px";
            },1000);
        },
        stop : function(){
            clearInterval(this.timer);   
        }
    }

    var sceneMask = {
        show : function(tipsWord){
            mask.innerHTML = "<p class='des'>" + tipsWord + "</p>";
            mask.style["background"] = "rgba(0,0,0,0.8)";
            mask.style["display"] = "block";
        },
        hide : function(){
            mask.style["display"] = "none";
        }
    }

    function loadingFn(callback){
        var loadingBox = d.getElementById("loading-box"),
            loadingBar = d.getElementById("loading-bar"),
            progressBar = d.getElementById("progress-bar"),
            loadW = loadingBox.offsetWidth,
            imgArr = [],
            iNow = 0;

        for(var i = 0 ; i < imgData.count ; i++){
            imgArr.push("images/"+ (imgData.imgInfo[i].src) + "_a.jpg");
            imgArr.push("images/"+ (imgData.imgInfo[i].src) + "_b.jpg");
        }

        function loadImage() { 

            var showImg = new Image();
            showImg.onload = function(){
                iNow++;
                if(iNow < imgArr.length){
                    loadingBar.style["width"] = parseInt(iNow/(imgArr.length-1)*loadW) + "px";
                    progressBar.innerHTML = parseInt(iNow/(imgArr.length-1)*100) + "%";
                    loadImage();
                }
                else{
                    gameShowTimer = setTimeout(function(){
                        layer.style["display"] = "none";
                        callback && callback();
                    },600);  
                }
                
            }
            showImg.src = imgArr[iNow];
        }

        loadImage();

    }

    

    loadingFn(game.init);
    

}()