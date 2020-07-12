!function(e){var r={};function t(n){if(r[n])return r[n].exports;var a=r[n]={i:n,l:!1,exports:{}};return e[n].call(a.exports,a,a.exports,t),a.l=!0,a.exports}t.m=e,t.c=r,t.d=function(e,r,n){t.o(e,r)||Object.defineProperty(e,r,{enumerable:!0,get:n})},t.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.t=function(e,r){if(1&r&&(e=t(e)),8&r)return e;if(4&r&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(t.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&r&&"string"!=typeof e)for(var a in e)t.d(n,a,function(r){return e[r]}.bind(null,a));return n},t.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(r,"a",r),r},t.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)},t.p="",t(t.s=25)}([function(e,r,t){"use strict";var n=t(20),a=t.n(n),o=t(13);t(14).config();var u=o.name,i=o.version,s={develoment:{PORT:process.env.PORT,mongoKey:process.env.MONGO_KEY,tinyKey:process.env.TINY_KEY,jwtKey:process.env.JWT_KEY,awsID:process.env.AWS_ID,awsKey:process.env.AWS_KEY,bucket:process.env.S3_BUCKET,log:function(){return e=u,r=i,t="debug",a.a.createLogger({name:"".concat(e,":").concat(r),level:t});var e,r,t}}};r.a=s},function(e,r){e.exports=require("mongoose")},function(e,r,t){"use strict";t.d(r,"b",(function(){return m})),t.d(r,"c",(function(){return v})),t.d(r,"a",(function(){return g}));var n=t(1),a=t.n(n),o=t(6),u=t.n(o),i=t(5),s=t.n(i);function c(e,r,t,n,a,o,u){try{var i=e[o](u),s=i.value}catch(e){return void t(e)}i.done?r(s):Promise.resolve(s).then(n,a)}var p=new n.Schema({username:{type:String,required:!0,unique:!0},hashPassword:{type:String,required:!0},type:{type:String,required:!0},created_date:{type:Date,default:Date.now},displayName:{type:String,required:!0}});p.methods.comparePassword=function(){var e,r=(e=regeneratorRuntime.mark((function e(r,t){var n;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,u.a.compare(r,t);case 3:return n=e.sent,e.abrupt("return",n);case 7:return e.prev=7,e.t0=e.catch(0),e.abrupt("return",e.t0);case 10:case"end":return e.stop()}}),e,null,[[0,7]])})),function(){var r=this,t=arguments;return new Promise((function(n,a){var o=e.apply(r,t);function u(e){c(o,n,a,u,i,"next",e)}function i(e){c(o,n,a,u,i,"throw",e)}u(void 0)}))});return function(e,t){return r.apply(this,arguments)}}();var d=t(0);function f(e,r,t,n,a,o,u){try{var i=e[o](u),s=i.value}catch(e){return void t(e)}i.done?r(s):Promise.resolve(s).then(n,a)}var l=a.a.model("User",p),m=function(e,r,t){if(!e.user||"admin"!==e.user.type)return r.status(401).json({message:"Unauthorized User"});t()},v=function(){var e,r=(e=regeneratorRuntime.mark((function e(r,t){var n,a;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,(n=new l(r.body)).displayName=n.username,n.username=n.username.toLowerCase(),e.next=6,u.a.hash(r.body.password,10);case 6:return n.hashPassword=e.sent,e.next=9,n.save();case 9:return(a=e.sent).hashPassword=void 0,e.abrupt("return",t.json(a));case 14:return e.prev=14,e.t0=e.catch(0),e.abrupt("return",t.status(400).send({message:e.t0}));case 17:case"end":return e.stop()}}),e,null,[[0,14]])})),function(){var r=this,t=arguments;return new Promise((function(n,a){var o=e.apply(r,t);function u(e){f(o,n,a,u,i,"next",e)}function i(e){f(o,n,a,u,i,"throw",e)}u(void 0)}))});return function(e,t){return r.apply(this,arguments)}}(),g=function(e,r){l.findOne({username:e.body.username.toLowerCase()},(function(t,n){if(t)throw t;return n?n?n.comparePassword(e.body.password,n.hashPassword)?r.json({displayName:n.displayName,username:e.body.username,success:!0,message:"Success",token:s.a.sign({type:n.type,username:n.username,_id:n.id},d.a.develoment.jwtKey)}):r.status(401).json({username:e.body.username,success:!1,message:"Authenticacion failed. Incorrect Password!",token:null}):void 0:r.status(401).json({username:e.body.username,success:!1,message:"Authenticacion failed. No user found!",token:null})}))}},function(e,r){e.exports=require("express")},function(e,r){e.exports=require("tinify")},function(e,r){e.exports=require("jsonwebtoken")},function(e,r){e.exports=require("bcrypt")},function(e,r,t){"use strict";(function(e){var n=t(17),a=t.n(n),o=t(3),u=t.n(o),i=t(9),s=t.n(i),c=t(18),p=t.n(c),d=t(19),f=t.n(d),l=t(10),m=t.n(l),v=t(4),g=t.n(v),y=t(5),b=t.n(y),h=(t(8),t(23)),w=t(21),x=t(24),k=t(22),j=t(0);g.a.key=j.a.develoment.tinyKey;var S=u()(),R=j.a.develoment.log();j.a.develoment.bucket;S.use(p()()),S.use(f()()),S.options("*",m()({credentials:!0,origin:!0})),S.use(m()({credentials:!0,origin:!0})),S.use(s.a.json()),S.use(s.a.urlencoded({extended:!0})),Object(k.a)(j.a.develoment.mongoKey),S.use((function(e,r,t){e.headers&&e.headers.authorization&&"JWT"===e.headers.authorization.split(" ")[0]?b.a.verify(e.headers.authorization.split(" ")[1],j.a.develoment.jwtKey,(function(r,n){r&&(e.user=void 0),e.user=n,t()})):(e.user=void 0,t())})),S.use("/inventario",h.a),S.use("/auth",w.a),S.use("/ventas",x.a),S.use("/static",u.a.static(a.a.join(e,"uploads"))),S.use((function(e,r,t,n){return t.status(e.status||500),R.error(e),t.json({error:{message:e.message}})})),r.a=S}).call(this,"/")},function(e,r){e.exports=require("aws-sdk")},function(e,r){e.exports=require("body-parser")},function(e,r){e.exports=require("cors")},function(e,r){e.exports=require("multer")},function(e,r){e.exports=require("multer-s3")},function(e){e.exports=JSON.parse('{"name":"inv-mannager","version":"0.0.1","description":"Manejo General De Inventario De Sirio Dinar","main":"index.js","scripts":{"build":"webpack -p","start":"node ./dist/main.js","dev:start":"nodemon --exec babel-node ./bin/www.js | bunyan"},"keywords":["inventario","siriodinar"],"author":"Tac Etarip","license":"ISC","devDependencies":{"@babel/core":"^7.10.2","@babel/node":"^7.10.1","@babel/preset-env":"^7.10.2","babel-loader":"^8.1.0","webpack":"^4.43.0","webpack-cli":"^3.3.12","webpack-node-externals":"^2.5.0"},"dependencies":{"aws-sdk":"^2.713.0","babel-polyfill":"^6.26.0","bcrypt":"^5.0.0","body-parser":"^1.19.0","bunyan":"^1.8.14","compression":"^1.7.4","cors":"^2.8.5","dotenv":"^8.2.0","express":"^4.17.1","helmet":"^3.23.3","jsonwebtoken":"^8.5.1","mongoose":"^5.9.18","multer":"^1.4.2","multer-s3":"^2.9.0","throng":"^4.0.0","tinify":"^1.6.0-beta.2"},"engines":{"node":"12.18.x"}}')},function(e,r){e.exports=require("dotenv")},function(e,r){e.exports=require("http")},function(e,r){e.exports=require("throng")},function(e,r){e.exports=require("path")},function(e,r){e.exports=require("helmet")},function(e,r){e.exports=require("compression")},function(e,r){e.exports=require("bunyan")},function(e,r,t){"use strict";var n=t(3),a=t(2),o=new n.Router;o.post("/register",a.c),o.post("/login",a.a),r.a=o},function(e,r,t){"use strict";var n=t(1),a=t.n(n);function o(e,r,t,n,a,o,u){try{var i=e[o](u),s=i.value}catch(e){return void t(e)}i.done?r(s):Promise.resolve(s).then(n,a)}var u=t(0).a.develoment.log(),i=function(){var e,r=(e=regeneratorRuntime.mark((function e(r){return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,a.a.connect(r,{useNewUrlParser:!0,useUnifiedTopology:!0,useCreateIndex:!0});case 3:return e.abrupt("return",u.info("Connected To DataBase"));case 6:return e.prev=6,e.t0=e.catch(0),e.abrupt("return",u.error(e.t0));case 9:case"end":return e.stop()}}),e,null,[[0,6]])})),function(){var r=this,t=arguments;return new Promise((function(n,a){var u=e.apply(r,t);function i(e){o(u,n,a,i,s,"next",e)}function s(e){o(u,n,a,i,s,"throw",e)}i(void 0)}))});return function(e){return r.apply(this,arguments)}}();r.a=i},function(e,r,t){"use strict";var n=t(3),a=t(1),o=t.n(a),u=new a.Schema({name:{type:String,required:!0,trim:!0},priceIGV:{type:Number,required:!0},priceNoIGV:{type:Number},cantidad:{type:Number,default:0},codigo:{type:String,required:!0,trim:!0,unique:!0},tipo:{type:String,default:"Indefinido"},unidadDeMedida:{type:String,default:"UND",trim:!0},oferta:{type:Number,default:0},date:{type:Date,default:Date.now},description:{type:String,trim:!0},photo:{type:String,trim:!0,default:"noPhoto.jpg"},ficha:{type:Boolean,default:!1}});function i(e,r,t,n,a,o,u){try{var i=e[o](u),s=i.value}catch(e){return void t(e)}i.done?r(s):Promise.resolve(s).then(n,a)}function s(e){return function(){var r=this,t=arguments;return new Promise((function(n,a){var o=e.apply(r,t);function u(e){i(o,n,a,u,s,"next",e)}function s(e){i(o,n,a,u,s,"throw",e)}u(void 0)}))}}var c=o.a.model("Item",u),p=function(){var e=s(regeneratorRuntime.mark((function e(r,t){var n,a;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,(n=new c(r.body)).priceNoIGV=x(n.priceIGV),e.next=5,d(n.name,n.tipo);case 5:return n.codigo=e.sent,e.next=8,n.save();case 8:return a=e.sent,e.abrupt("return",t.json(a));case 12:return e.prev=12,e.t0=e.catch(0),e.abrupt("return",t.status(500).json({errorMSG:e.t0}));case 15:case"end":return e.stop()}}),e,null,[[0,12]])})));return function(r,t){return e.apply(this,arguments)}}(),d=function(){var e=s(regeneratorRuntime.mark((function e(){var r,t,n,a=arguments;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return r=a.length>0&&void 0!==a[0]?a[0]:"",t=a.length>1&&void 0!==a[1]?a[1]:"",e.prev=2,e.next=5,c.countDocuments({});case 5:return n=e.sent,e.abrupt("return",n.toString()+"SD"+r.charAt(0)+t.charAt(0)+Math.floor(10*Math.random()).toString());case 9:return e.prev=9,e.t0=e.catch(2),e.abrupt("return",new Error(e.t0));case 12:case"end":return e.stop()}}),e,null,[[2,9]])})));return function(){return e.apply(this,arguments)}}(),f=function(){var e=s(regeneratorRuntime.mark((function e(r,t){var n;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,c.find({});case 3:return n=e.sent,e.abrupt("return",t.json(n));case 7:return e.prev=7,e.t0=e.catch(0),e.abrupt("return",t.status(500).json({errorMSG:e.t0}));case 10:case"end":return e.stop()}}),e,null,[[0,7]])})));return function(r,t){return e.apply(this,arguments)}}(),l=function(){var e=s(regeneratorRuntime.mark((function e(r,t){var n;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,c.find({tipo:r.params.tipo});case 3:return n=e.sent,e.abrupt("return",t.json(n));case 7:return e.prev=7,e.t0=e.catch(0),e.abrupt("return",t.status(500).json({errorMSG:e.t0}));case 10:case"end":return e.stop()}}),e,null,[[0,7]])})));return function(r,t){return e.apply(this,arguments)}}(),m=function(){var e=s(regeneratorRuntime.mark((function e(r,t){var n;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:n={},e.prev=1,e.t0=r.params.tipo,e.next="cod"===e.t0?5:"name"===e.t0?9:"tipo"===e.t0?13:17;break;case 5:return e.next=7,c.findOne({codigo:r.params.codigo});case 7:return n=e.sent,e.abrupt("break",19);case 9:return e.next=11,c.find({name:r.body.name});case 11:return n=e.sent,e.abrupt("break",19);case 13:return e.next=15,c.find({tipo:r.body.tipo});case 15:return n=e.sent,e.abrupt("break",19);case 17:return n={message:"Not A Type Of Search"},e.abrupt("break",19);case 19:return e.abrupt("return",t.json(n));case 22:return e.prev=22,e.t1=e.catch(1),e.abrupt("return",t.status(500).json({errorMSG:e.t1}));case 25:case"end":return e.stop()}}),e,null,[[1,22]])})));return function(r,t){return e.apply(this,arguments)}}(),v=function(){var e=s(regeneratorRuntime.mark((function e(r,t){var n,a,o;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(e.prev=0,n={},a=0,o=0,"redu"!==r.params.tipo){e.next=19;break}return e.next=7,c.findOne({codigo:r.body.codigo});case 7:if(n=e.sent,!((a=n.cantidad)>=r.body.cantidad)){e.next=16;break}return o=a-r.body.cantidad,e.next=13,c.findOneAndUpdate({codigo:r.body.codigo},{cantidad:o},{new:!0,useFindAndModify:!1});case 13:n=e.sent,e.next=17;break;case 16:return e.abrupt("return",t.status(409).json({message:"No Hay Los Suficientes Items En Stock"}));case 17:e.next=32;break;case 19:if("aume"!==r.params.tipo){e.next=31;break}return e.next=22,c.findOne({codigo:r.body.codigo});case 22:if(n=e.sent,!((a=n.cantidad)>=r.body.cantidadRedu)){e.next=29;break}return o=a+r.body.cantidadRedu,e.next=28,c.findOneAndUpdate({codigo:r.body.codigo},{cantidad:o},{new:!0,useFindAndModify:!1});case 28:n=e.sent;case 29:e.next=32;break;case 31:return e.abrupt("return",t.json({message:"Not An opc"}));case 32:return e.abrupt("return",t.json(n));case 35:return e.prev=35,e.t0=e.catch(0),e.abrupt("return",t.status(500).json({errorMSG:e.t0}));case 38:case"end":return e.stop()}}),e,null,[[0,35]])})));return function(r,t){return e.apply(this,arguments)}}(),g=function(){var e=s(regeneratorRuntime.mark((function e(r,t){var n,a;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,(n=r.body).priceIGV&&(n.priceNoIGV=x(n.priceIGV)),e.next=5,c.findOneAndUpdate({codigo:r.body.codigo},n,{new:!0,useFindAndModify:!1});case 5:a=e.sent,t.json(a),e.next=12;break;case 9:return e.prev=9,e.t0=e.catch(0),e.abrupt("return",t.status(500).json({errorMSG:e.t0}));case 12:case"end":return e.stop()}}),e,null,[[0,9]])})));return function(r,t){return e.apply(this,arguments)}}(),y=function(){var e=s(regeneratorRuntime.mark((function e(r,t){var n;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,c.findByIdAndDelete({codigo:r.body.codigo});case 3:n=e.sent,t.json(n),e.next=10;break;case 7:return e.prev=7,e.t0=e.catch(0),e.abrupt("return",t.status(500).json({errorMSG:e.t0}));case 10:case"end":return e.stop()}}),e,null,[[0,7]])})));return function(r,t){return e.apply(this,arguments)}}(),b=function(){var e=s(regeneratorRuntime.mark((function e(r,t){var n;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,c.findOneAndUpdate({codigo:r.body.codigo},{oferta:r.body.ofertaNum},{new:!0,useFindAndModify:!1});case 3:n=e.sent,t.json(n),e.next=10;break;case 7:return e.prev=7,e.t0=e.catch(0),e.abrupt("return",t.status(500).json({errorMSG:e.t0}));case 10:case"end":return e.stop()}}),e,null,[[0,7]])})));return function(r,t){return e.apply(this,arguments)}}(),h=function(){var e=s(regeneratorRuntime.mark((function e(r,t){var n;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,c.findOneAndUpdate({codigo:r.body.codigo},{oferta:0},{new:!0,useFindAndModify:!1});case 3:n=e.sent,t.status(200).json({res:n,uploadInfo:r.uploadInfo}),e.next=10;break;case 7:throw e.prev=7,e.t0=e.catch(0),t.status(500).json({errorMSG:e.t0});case 10:case"end":return e.stop()}}),e,null,[[0,7]])})));return function(r,t){return e.apply(this,arguments)}}(),w=function(){var e=s(regeneratorRuntime.mark((function e(r,t){var n;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,c.findOneAndUpdate({codigo:r.params.codigo},{photo:r.fileName},{new:!0,useFindAndModify:!1});case 3:n=e.sent,t.status(200).json({res:n,uploadInfo:r.uploadInfo}),e.next=10;break;case 7:return e.prev=7,e.t0=e.catch(0),e.abrupt("return",t.status(500).json({errorMSG:e.t0}));case 10:case"end":return e.stop()}}),e,null,[[0,7]])})));return function(r,t){return e.apply(this,arguments)}}(),x=function(e){var r=e/1.18;return Math.round(100*(r+Number.EPSILON))/100},k=function(){var e=s(regeneratorRuntime.mark((function e(r,t){var n;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,c.findOneAndUpdate({codigo:r.params.codigo},{ficha:!0},{new:!0,useFindAndModify:!1});case 3:n=e.sent,t.status(200).json({res:n,uploadInfo:r.uploadInfo}),e.next=10;break;case 7:return e.prev=7,e.t0=e.catch(0),e.abrupt("return",t.status(500).json({errorMSG:e.t0}));case 10:case"end":return e.stop()}}),e,null,[[0,7]])})));return function(r,t){return e.apply(this,arguments)}}(),j=new a.Schema({name:{type:String,required:!0,unique:!0},date:{type:Date,default:Date.now}});function S(e,r,t,n,a,o,u){try{var i=e[o](u),s=i.value}catch(e){return void t(e)}i.done?r(s):Promise.resolve(s).then(n,a)}function R(e){return function(){var r=this,t=arguments;return new Promise((function(n,a){var o=e.apply(r,t);function u(e){S(o,n,a,u,i,"next",e)}function i(e){S(o,n,a,u,i,"throw",e)}u(void 0)}))}}var P=o.a.model("Tipo",j),q=function(){var e=R(regeneratorRuntime.mark((function e(r,t){var n,a;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,n=new P(r.body),e.next=4,n.save();case 4:return a=e.sent,e.abrupt("return",t.json(a));case 8:return e.prev=8,e.t0=e.catch(0),e.abrupt("return",t.status(500).json({errorMSG:e.t0}));case 11:case"end":return e.stop()}}),e,null,[[0,8]])})));return function(r,t){return e.apply(this,arguments)}}(),N=function(){var e=R(regeneratorRuntime.mark((function e(r,t){var n;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,P.find({});case 3:return n=e.sent,e.abrupt("return",t.json(n));case 7:return e.prev=7,e.t0=e.catch(0),e.abrupt("return",t.status(500).json({errorMSG:e.t0}));case 10:case"end":return e.stop()}}),e,null,[[0,7]])})));return function(r,t){return e.apply(this,arguments)}}(),I=t(11),M=t.n(I),O=t(12),G=t.n(O),D=t(8),A=t.n(D),T=(t(4),t(0));function K(e,r,t,n,a,o,u){try{var i=e[o](u),s=i.value}catch(e){return void t(e)}i.done?r(s):Promise.resolve(s).then(n,a)}function _(e){return function(){var r=this,t=arguments;return new Promise((function(n,a){var o=e.apply(r,t);function u(e){K(o,n,a,u,i,"next",e)}function i(e){K(o,n,a,u,i,"throw",e)}u(void 0)}))}}var C=new A.a.S3({accessKeyId:T.a.develoment.awsID,secretAccessKey:T.a.develoment.awsKey,Bucket:T.a.develoment.bucket,region:"us-east-1"}),E=function(){var e=_(regeneratorRuntime.mark((function e(r,t){var n;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,C.getObject({Bucket:T.a.develoment.bucket,Key:r.params.imgName}).promise();case 3:n=e.sent,t.writeHead(200,{"Content-Type":"image/jpeg"}),t.write(n.Body,"binary"),t.end(null,"binary"),e.next=12;break;case 9:return e.prev=9,e.t0=e.catch(0),e.abrupt("return",t.status(500).json({message:e.t0}));case 12:case"end":return e.stop()}}),e,null,[[0,9]])})));return function(r,t){return e.apply(this,arguments)}}(),U=function(){var e=_(regeneratorRuntime.mark((function e(r,t){var n;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,C.getObject({Bucket:T.a.develoment.bucket,Key:r.params.pdfName}).promise();case 3:n=e.sent,t.writeHead(200,{"Content-Type":"aplication/pdf"}),t.write(n.Body,"binary"),t.end(null,"binary"),e.next=12;break;case 9:return e.prev=9,e.t0=e.catch(0),e.abrupt("return",t.status(500).json({message:e.t0}));case 12:case"end":return e.stop()}}),e,null,[[0,9]])})));return function(r,t){return e.apply(this,arguments)}}(),V=M()({storage:G()({s3:C,bucket:T.a.develoment.bucket,metadata:function(e,r,t){t(null,Object.assign({},e.body))},key:function(e,r,t){var n=r.originalname.split(".")[1];t(null,r.fieldname+"-"+e.params.codigo+"-"+Date.now().toString()+"."+n)}}),limits:{fileSize:1e6},fileFilter:function(e,r,t){r.originalname.match(/\.(jpg|jpeg|png)$/)||t(new Error("Please upload JPG and PNG images only!")),r.size>1e6&&t(new Error("Please upload JPG and PNG images only!")),t(void 0,!0)}}),F=M()({storage:G()({s3:C,bucket:T.a.develoment.bucket,metadata:function(e,r,t){t(null,Object.assign({},e.body))},key:function(e,r,t){t(null,"ficha-"+e.params.codigo+".pdf")}}),limits:{fileSize:1e6},fileFilter:function(e,r,t){r.originalname.match(/\.(pdf)$/)||t(new Error("Please upload PDF only!")),t(void 0,!0)}}),B=t(2),z=new n.Router;z.post("/addItem",B.b,p),z.get("/getItems",f),z.get("/getItemsByType/:tipo",l),z.get("/getItem/:tipo/:codigo",m),z.put("/modCant/:tipo",B.b,v),z.put("/updateItem",B.b,g),z.delete("/deleteItem",B.b,y),z.put("/offer/add",B.b,b),z.put("/offer/remove",B.b,h),z.post("/addTipo",B.b,q),z.get("/getTipos",N),z.post("/uploads/image/:codigo",B.b,V.single("img"),(function(e,r,t){var n=e.file;if(!n){var a=new Error("Please upload a file");return a.httpStatusCode=400,t(a)}e.fileName=n.key,e.uploadInfo={statusCode:200,status:"success",uploadedFile:n},t()}),w),z.post("/uploads/ficha/:codigo",B.b,F.single("pdf"),(function(e,r,t){var n=e.file;if(!n){var a=new Error("Please upload a file");return a.httpStatusCode=400,t(a)}e.uploadInfo={statusCode:200,status:"success",uploadedFile:n},t()}),k),z.get("/image/:imgName",E),z.get("/pdf/:pdfName",U);r.a=z},function(e,r,t){"use strict";var n=t(3),a=t(1),o=t.n(a),u=new a.Schema({type:{type:String,required:!0,trim:!0},codigo:{type:Number,trim:!0,required:!0}},{_id:!1}),i=new a.Schema({codigo:{type:String,required:!0,trim:!0},priceIGV:{type:Number,required:!0,trim:!0},priceNoIGV:{type:Number,required:!0,trim:!0},cantidad:{type:Number,required:!0,trim:!0}},{_id:!1}),s=new a.Schema({codigo:{type:String,required:!0,trim:!0,unique:!0},totalPrice:{type:Number,trim:!0,required:!0},totalPriceNoIGV:{type:Number,trim:!0,required:!0},estado:{type:String,trim:!0,required:!0},documento:{type:u,required:!0},itemsVendidos:{type:[i],required:!0},date:{type:Date,default:Date.now}});function c(e,r,t,n,a,o,u){try{var i=e[o](u),s=i.value}catch(e){return void t(e)}i.done?r(s):Promise.resolve(s).then(n,a)}function p(e){return function(){var r=this,t=arguments;return new Promise((function(n,a){var o=e.apply(r,t);function u(e){c(o,n,a,u,i,"next",e)}function i(e){c(o,n,a,u,i,"throw",e)}u(void 0)}))}}var d=o.a.model("Venta",s),f=function(){var e=p(regeneratorRuntime.mark((function e(r,t){var n,a;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,n=new d(r.body),e.next=4,l();case 4:return n.codigo=e.sent,e.next=7,n.save();case 7:a=e.sent,t.json(a),e.next=15;break;case 11:return e.prev=11,e.t0=e.catch(0),console.log(e.t0),e.abrupt("return",t.status(500).json({errorMSG:e.t0}));case 15:case"end":return e.stop()}}),e,null,[[0,11]])})));return function(r,t){return e.apply(this,arguments)}}(),l=function(){var e=p(regeneratorRuntime.mark((function e(){var r,t,n,a;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,d.countDocuments({});case 3:for(r=e.sent,t="SD-000000",n=0;n<r.toString().length;n++)t=t.slice(0,-1);return a=t+r.toString(),e.abrupt("return",a);case 10:return e.prev=10,e.t0=e.catch(0),e.abrupt("return",res.status(500).json({errorMSG:e.t0}));case 13:case"end":return e.stop()}}),e,null,[[0,10]])})));return function(){return e.apply(this,arguments)}}(),m=t(2),v=new n.Router;v.post("/generarVenta",m.b,f);r.a=v},function(e,r,t){t(26),e.exports=t(27)},function(e,r){e.exports=require("babel-polyfill")},function(e,r,t){"use strict";t.r(r);var n=t(15),a=t.n(n),o=t(16),u=t.n(o),i=t(7),s=t(0);t(14).config();var c=a.a.createServer(i.a),p=s.a.develoment.PORT,d=s.a.develoment.log(),f=process.env.WEB_CONCURRENCY||1;i.a.set("port",p);u()({workers:f,lifetime:1/0},(function(){c.listen(p||0)})),c.on("listening",(function(){d.info("Hi there! I'm listening on port ".concat(c.address().port," in ").concat(i.a.get("env")," mode."))}))}]);