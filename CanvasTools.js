class CanvasTools{
  static toImageElementDelay=0; //toXXX 의 딜레이 부분
  static textBox(ctxConf,width,height,text,lineHeightPx,paddingPx,bgFillStyle){
    if(!ctxConf) ctxConf = {};
    if(!bgFillStyle) bgFillStyle = null;
    if(paddingPx==undefined) paddingPx = 0;
    let canvas = document.createElement('canvas');
    canvas.dataset.width = width
    canvas.dataset.height = height
    canvas.dataset.text = text
    canvas.dataset.lineHeightPx = lineHeightPx
    canvas.dataset.paddingPx = paddingPx
    canvas.width = width;
    canvas.height = height?height:300; //height 가 없으면 밑에서 자동 재계산한다.
    let ctx = canvas.getContext('2d');
    console.log();
    for(var k in ctxConf){
      ctx[k] = ctxConf[k];
    }
    // 줄바꿈 계산
    let textWidth = canvas.width-paddingPx*2;
    let lines = [''];
    let linePos = 0;
    let tmpText = '';
    for(let i=0,m=text.length;i<m;i++){
      
      tmpText = lines[linePos];
      tmpText += text[i];
      if(text[i] == '\n'){ //줄바꿈 처리
        lines.push(text[i].trim())
        linePos++;
        continue;
      }
      if(i===0 || textWidth >= ctx.measureText(tmpText).width){
        lines[linePos] = tmpText;
      }else{
        lines[linePos] = lines[linePos].trim();
        // lines[linePos] = lines[linePos];
        lines.push(text[i])
        linePos++
      }
    }


    if(!height){
      canvas.height = Math.ceil(lineHeightPx*(lines.length)) + (paddingPx*2);
    }
    ctx = canvas.getContext('2d');
    if(bgFillStyle){
      ctx.save();
      ctx.fillStyle = bgFillStyle;
      ctx.beginPath()
      ctx.rect(0,0,canvas.width,canvas.height);
      ctx.fill()
      ctx.restore();
    }
    for(var k in ctxConf){
      ctx[k] = ctxConf[k];
    }

    let x = 0;
    switch(ctx.textAlign){
      case 'center':x=Math.ceil(canvas.width/2); break;
      case 'right':x=canvas.width-paddingPx; break;
      case 'left':x=paddingPx; break;
    }
    lines.forEach((text,idx)=>{
      ctx.fillText(text, x, lineHeightPx*(idx+1)+paddingPx)
      ctx.strokeText(text, x, lineHeightPx*(idx+1)+paddingPx)
    })

    
    return canvas
  }
  static toCanvas(canvas,bgFillStyle){ // clone
    return this.canvasFromImage(canvas,bgFillStyle)
  }
  static copyCanvas(canvas,bgFillStyle){ // clone
    return this.canvasFromImage(canvas,bgFillStyle)
  }
  static canvas(w,h,bgFillStyle){
    let canvas = document.createElement('canvas');
    canvas.width = w
    canvas.height = h
    let ctx = canvas.getContext('2d')
    if(bgFillStyle){
      ctx.save();
      ctx.fillStyle = bgFillStyle;
      ctx.beginPath()
      ctx.rect(0,0,canvas.width,canvas.height);
      ctx.fill()
      ctx.restore();
    }
    return canvas;
  }
  static canvasFromImage(image,bgFillStyle){
    // let canvas = document.createElement('canvas');
    let width = image.naturalWidth || image.width;
    let height = image.naturalHeight || image.height;
    let canvas = this.canvas(width,height,bgFillStyle)
    let ctx = canvas.getContext('2d');
    ctx.drawImage(image,0,0,canvas.width,canvas.height,0,0,canvas.width,canvas.height);
    return canvas;
  }
  static fromImageCb(image,cb,bgFillStyle){
    cb(this.canvasFromImage(image,bgFillStyle));
  }
  static fromImage(image,bgFillStyle){
    return new Promise((resolve)=>{ resolve(this.canvasFromImage(image,bgFillStyle)) });
  }
  static fromBlobCb(blob,cb,bgFillStyle){
    var image = new Image();
    image.onload = ()=>{
      let canvas = this.canvasFromImage(image,bgFillStyle);
      cb(canvas);
      URL.revokeObjectURL(url);
    }
    let url = URL.createObjectURL(blob);
    image.src = url
  }
  static fromBlob(blob,bgFillStyle){
    return new Promise((resolve)=>{
      var image = new Image();
      image.onload = ()=>{
        let canvas = this.canvasFromImage(image,bgFillStyle);
        resolve(canvas) 
        URL.revokeObjectURL(url);
      }
      let url = URL.createObjectURL(blob);
      image.src = url
    });
  }
  static fromSvgCb(svg,cb,bgFillStyle){    
    let data = (new XMLSerializer()).serializeToString(svg);
    let blob = new Blob([data], { type: 'image/svg+xml' });
    this.fromBlobCb(blob,cb,bgFillStyle);
  }
  static fromSvg(svg,bgFillStyle){
    let data = (new XMLSerializer()).serializeToString(svg);
    let blob = new Blob([data], { type: 'image/svg+xml' });
    return this.fromBlob(blob,bgFillStyle)
  }
  static resize(target,w,h){
    let source = this.canvasFromImage(target);
    target.width = w;
    target.height = h;
    return this.drawImage(target,source,0,0,source.width,source.height,0,0,w,h,0);
  }
  static crop(target,x,y,w,h){
    let source = this.canvasFromImage(target);
    target.width = w;
    target.height = h;
    return this.drawImage(target,source,x,y,w,h,0,0,w,h,0);
  }
  static drawImage(target,source,sx,sy,sw,sh,dx,dy,dw,dh,rotateCenterDegree){
    let ctx = target.getContext('2d')
    const rotateAngle = rotateCenterDegree *  Math.PI / 180;
    ctx.save();
    ctx.translate(dx+dw/2, dy+dh/2);
    ctx.rotate(rotateAngle);
    ctx.translate(-1*(dx+dw/2), -1*(dy+dh/2));
    // ctx.translate(dx, dy);
    // ctx.drawImage(source,sx,sy,sw,sh,0,0,dw,dh);
    ctx.drawImage(source,sx,sy,sw,sh,dx,dy,dw,dh);
    ctx.restore();
    return target;
  }
  static // blobToDataUrl(blob) {
  //   return new Promise(r => {let a=new FileReader(); a.onload=r; a.readAsDataURL(blob)}).then(e => e.target.result);
  // },
  toBlob(canvas,type,encoderOptions){
    return new Promise((resolve)=>{
      canvas.toBlob((blob) => {
        resolve(blob)
      },type,encoderOptions);
    });
  }
  static toDataURL(canvas,type,encoderOptions){
    return new Promise((resolve)=>{
      const dataURL =canvas.toDataURL(type,encoderOptions);
      resolve(dataURL)
    });
    
    
  }
  static toImage(canvas,cb,type,encoderOptions){
    try{
      // throw 'error test'; //for debug
      return this.toImageWithBlob(canvas,type,encoderOptions);
    }catch(e){
      console.error(e)
      return this.toImageWithDataURL(canvas,type,encoderOptions);
    }
  }
  static toImageWithBlob(canvas,type,encoderOptions){
    if(!type){type='image/png'}
    return this.toBlob(canvas,type,encoderOptions)
      .then((blob) => {
        return new Promise((resolve)=>{
          let img = new Image();
          img.crossOrigin="anonymous"
          img.dataset.type=type;
          img.dataset.encoderOptions=encoderOptions;
          img.dataset.type=blob.type;
          img.dataset.size=blob.size;
          const url = URL.createObjectURL(blob);
          img.onload = (event)=>{
            if(this.toImageElementDelay>0){ setTimeout(()=>{ resolve(img); },this.toImageElementDelay) }
            else{ resolve(img); }
            URL.revokeObjectURL(url);
          }
          img.src = url;
        }); 
      }
    );
  }
  static toImageWithDataURL(canvas,type,encoderOptions){
    if(!type){type='image/png'}
    
    return this.toDataURL(canvas,type,encoderOptions)
      .then(
        (dataURL) => {
          return new Promise((resolve)=>{
            let img = new Image();
            img.crossOrigin="anonymous"
            img.dataset.type=type;
            img.dataset.encoderOptions=encoderOptions;
            img.onload = (event)=>{
              if(this.toImageElementDelay>0){ setTimeout(()=>{ resolve(img); },this.toImageElementDelay) }
              else{ resolve(img); }
            }
            img.src = dataURL;
          });
        }
      );
  }
  static downloadWithBlob(canvas,filename,type,encoderOptions){
    this.toBlob(canvas,type,encoderOptions)
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.style.display = 'none';
        document.body.appendChild(a);
        a.download = filename;
        a.href = url
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    );
  }
  static downloadWithDataURL(canvas,filename,type,encoderOptions){
    this.toDataURL(canvas,type,encoderOptions)
      .then(
        (dataURL) => {
          let a = document.createElement('a');
          a.style.display = 'none';
          document.body.appendChild(a);
          a.download = filename;
          a.href = dataURL
          a.click();
        }
      );
  }
  static download(canvas,filename,type,encoderOptions){
    try{
      // throw 'error test'; //for debug
      return this.downloadWithBlob(canvas,filename,type,encoderOptions);
    }catch(e){
      console.error(e)
      return this.downloadWithDataURL(canvas,filename,type,encoderOptions);
    }
  }
}
