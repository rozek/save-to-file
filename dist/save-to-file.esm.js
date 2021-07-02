function e(e){var t=/^([$a-zA-Z][$a-zA-Z0-9]*):\s*(\S.+)\s*$/.exec(e);if(null==t)throw new Error(e);var n=new Error(t[2]);throw n.name=t[1],n}var t=/^\s*$/;function n(e){return("string"==typeof e||e instanceof String)&&!t.test(e.valueOf())}function r(t,n,r){var a=function(a,i){return function(t,n,r,a,i){if(null==n){if(a)return n;e("MissingArgument: no "+s(t)+" given")}else if(r(n))switch(!0){case n instanceof Boolean:case n instanceof Number:case n instanceof String:return n.valueOf();default:return n}else e("InvalidArgument: the given "+s(t)+" is no valid "+s(i))}(a,i,t,n,r)},i=t.name;return null!=i&&/^ValueIs/.test(i)?function(t,n){null==t&&e("MissingArgument: no function given");"function"!=typeof t&&e("InvalidArgument: the given 1st Argument is not a JavaScript function");null==n&&e("MissingArgument: no desired name given");"string"==typeof n||n instanceof String||e("InvalidArgument: the given desired name is not a string");if(t.name===n)return t;try{if(Object.defineProperty(t,"name",{value:n}),t.name===n)return t}catch(e){}return new Function("originalFunction","return function "+n+" () {return originalFunction.apply(this,Array.prototype.slice.apply(arguments))}")(t)}(a,i.replace(/^ValueIs/,n?"allow":"expect")):a}var a=r(n,false,"non-empty literal string");function s(e){return e.replace(/\\x[0-9a-zA-Z]{2}|\\u[0-9a-zA-Z]{4}|\\[0bfnrtv'"\\\/]?/g,(function(e){return"\\"===e?"\\\\":e})).replace(/[\x00-\x1f\x7f-\x9f]/g,(function(e){switch(e){case"\0":return"\\0";case"\b":return"\\b";case"\f":return"\\f";case"\n":return"\\n";case"\r":return"\\r";case"\t":return"\\t";case"\v":return"\\v";default:var t=e.charCodeAt(0).toString(16);return"\\x"+"00".slice(t.length)+t}}))}function i(e){return e.replace(/[&<>"'\u0000-\u001F\u007F-\u009F\\]/g,(function(e){switch(e){case"&":return"&amp;";case"<":return"&lt;";case">":return"&gt;";case'"':return"&quot;";case"'":return"&apos;";case"\n":return"\n";case"\\":return"&#92;";default:var t=e.charCodeAt(0).toString(16);return"&#x0000".substring(3,7-t.length)+t+";"}}))}function o(r){a("name of the file to save to",r);var s="";return{markup:function(r){var a,i=r.content;return n(i)&&(!function(t,n){var r=/^<([-a-z0-9]+)((?:[\s\xA0]+[-a-z0-9_]+(?:[\s\xA0]*=[\s\xA0]*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s\xA0]+))?)*)[\s\xA0]*(\/?)>/i,a=/^<\/([-a-z0-9_]+)[^>]*>/i,s=/([-a-z0-9]+)(?:[\s\xA0]*=[\s\xA0]*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s\xA0]+)))?/gi;function i(e){for(var t=e.split(","),n=Object.create(null),r=0,a=t.length;r<a;r++)n[t[r]]=!0;return n}var o=i("area,base,basefont,br,col,embed,frame,hr,img,input,isIndex,keygen,link,meta,param,source,track,wbr"),c=i("address,article,aside,audio,blockquote,canvas,center,dd,dir,div,dl,dt,fieldset,figcaption,figure,footer,form,frameset,h1,h2,h3,h4,h5,h6,header,hgroup,hr,ins,isIndex,li,main,menu,nav,noframes,noscript,ol,output,p,pre,section,table,tbody,td,tfoot,th,thead,tr,ul,video,applet"),l=i("a,abbr,acronym,Applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,Object,q,s,samp,Script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var"),u=i("area,base,basefont,bgsound,br,col,colgroup,dd,dt,embed,frame,hr,img,input,isIndex,keygen,li,link,menuitem,meta,options,p,param,source,td,tfoot,th,thead,tr,track,wbr"),f=i("script,style"),p=i("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected"),g=function(){},d=n.processStartTag||g,h=n.processEndTag||g,m=n.processText||g,v=n.processComment||g,b=[];function x(e,t,n,r){if(t=t.toLowerCase(),c[t])for(;null!=b.last()&&l[b.last()];)A("",b.last());if(u[t]&&b.last()===t&&A("",t),(r=o[t]||!!r)||b.push(t),d!==g){var a=[];n.replace(s,(function(e,t){var n=arguments[2]?arguments[2]:arguments[3]?arguments[3]:arguments[4]?arguments[4]:p[t]?t:"";return a.push({Name:t,Value:n,escapedValue:n.replace(/(^|[^\\])"/g,'$1\\"')}),""})),d(t,a,r,b.length===(r?0:1))}return""}function A(e,t){var n;if(null==t)n=0;else for(t=t.toLowerCase(),n=b.length-1;n>=0&&b[n]!==t;n--);if(n>=0){for(var r=b.length-1;r>=n;r--)h(b[r],0===r);b.length=n}return""}b.last=function(){return this[this.length-1]};for(var y=t;""!==t;){var w=!0;if(null!=b.last()&&f[b.last()])t=t.replace(new RegExp("^((?:.|\n)*?)</"+b.last()+"[^>]*>","i"),(function(e,t){return t=t.replace(/<!--(.*?)-->/g,"$1").replace(/<!\[CDATA\[(.*?)]]>/g,"$1"),m(t,0===b.length),""})),A(0,b.last());else{if(t.startsWith("\x3c!--"))(S=t.indexOf("--\x3e",4))>0&&(v(t.slice(4,S)),t=t.slice(S+3),w=!1);else if(t.startsWith("</"))null!=(k=t.match(a))&&(t=t.slice(k[0].length),k[0].replace(a,A),w=!1);else if(t.startsWith("<")){var k;null!=(k=t.match(r))&&(t=t.slice(k[0].length),k[0].replace(r,x),w=!1)}if(w){var S,O=(S=t.indexOf("<"))<0?t:t.slice(0,S);t=S<0?"":t.slice(S),m(O,0===b.length)}}if(t===y)switch(!0){case t.startsWith("<"):t=t.slice(1),m("&lt;",0===b.length);break;default:e('HTMLParseError: could not parse "'+t+'"')}y=t}A()}(i,{processStartTag:function(e,t,n,r){(!r||"style"!==e&&"script"!==e)&&(s+=function(e,t,n){for(var r="<"+e,a=0,s=t.length;a<s;a++){var i=t[a];r+=" "+i.Name+'="'+i.escapedValue+'"'}return r+(n?"/>":">")}(e,t,n))},processEndTag:function(e,t){(!t||"style"!==e&&"script"!==e)&&(s+="</"+e+">")},processText:function(e,t){s+=e},processComment:function(e){s+=e}}),("string"==typeof(a=s)||a instanceof String)&&t.test(a.valueOf())&&(s="")),Promise.resolve({code:i})},script:function(e){var t=e.attributes,r=e.content;if(n(r)){for(var a in"<script",t)t.hasOwnProperty(a)&&"lang"!==a&&" "+a+"="+i(t[a]);">\n",r=r.replace(/^\s*\n/,"").replace(/\n\s*$/,""),r,"\n<\/script>"}return Promise.resolve({code:r})},style:function(e){var t=e.attributes,r=e.content;if(n(r)){for(var a in"<style",t)t.hasOwnProperty(a)&&"lang"!==a&&" "+a+"="+i(t[a]);">\n",r=r.replace(/^\s*\n/,"").replace(/\n\s*$/,""),r,"\n</style>"}return Promise.resolve({code:r})}}}export default o;
//# sourceMappingURL=save-to-file.esm.js.map