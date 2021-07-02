//----------------------------------------------------------------------------//
// save-to-file - Svelte "preprocessor" that writes Results into a given File //
//----------------------------------------------------------------------------//
// see https://stackoverflow.com/questions/68213608/how-to-send-the-result-of-svelte-preprocess-into-a-file

  import fs   from 'fs'
  import path from 'path'

  import {
    throwError,
    ValueIsEmptyString, ValueIsNonEmptyString,
    expectNonEmptyString,
  } from 'javascript-interface-library'

  type PreprocessorResult = Promise<{
    code: string,
    dependencies?: Array<string>
  }>

  type MarkupPreprocessor = (
    input:{ content:string, filename:string }
  ) => PreprocessorResult

  type ScriptPreprocessor = (
    input:{ content:string, markup:string, attributes:Record<string,string>, filename:string }
  ) => PreprocessorResult

  type StylePreprocessor = (
    input:{ content:string, markup:string, attributes:Record<string,string>, filename:string }
  ) => PreprocessorResult

  type Preprocessor = {         // see https://svelte.dev/docs#svelte_preprocess
    markup?:MarkupPreprocessor,
    script?:ScriptPreprocessor,
    style?: StylePreprocessor
  }


//----------------------------------------------------------------------------//
//                                HTML Parsing                                //
//----------------------------------------------------------------------------//

  type HTMLAttribute = {
    Name:string,
    Value:string,
    escapedValue:string
  }

  type HTMLParserCallbackSet = {
    processStartTag ?: (TagName:string, Attributes:HTMLAttribute[], isUnary:boolean, isTopLevel:boolean) => any,
    processEndTag   ?: (TagName:string, isTopLevel:boolean) => any,
    processText     ?:    (Text:string, isTopLevel:boolean) => any,
    processComment  ?: (Comment:string) => any
  }

  type TagStack = string[] & { last:() => string|undefined }

  function parseHTML (HTML:string, Callbacks:HTMLParserCallbackSet):void {
    const StartTagPattern  = /^<([-a-z0-9]+)((?:[\s\xA0]+[-a-z0-9_]+(?:[\s\xA0]*=[\s\xA0]*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s\xA0]+))?)*)[\s\xA0]*(\/?)>/i
    const EndTagPattern    = /^<\/([-a-z0-9_]+)[^>]*>/i
    const AttributePattern = /([-a-z0-9]+)(?:[\s\xA0]*=[\s\xA0]*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s\xA0]+)))?/gi

  /**** MapOf makes a "map" with keys from a given comma-separated key list ****/

    function MapOf (Elements:string):{ [Key:string]:boolean } {
      let ElementList = Elements.split(',')
      let Result = Object.create(null)
        for (let i = 0, l = ElementList.length; i < l; i++) {
          Result[ElementList[i]] = true
        }
      return Result
    }

  /**** maps with the names of tags and attributes with a specific characteristic ****/

    const isEmptyElement = MapOf(
      'area,base,basefont,br,col,embed,frame,hr,img,input,isIndex,keygen,link,' +
      'meta,param,source,track,wbr'
    )

    const isBlockElement = MapOf(
      'address,article,aside,audio,blockquote,canvas,center,dd,dir,div,dl,dt,' +
      'fieldset,figcaption,figure,footer,form,frameset,h1,h2,h3,h4,h5,h6,header,' +
      'hgroup,hr,ins,isIndex,li,main,menu,nav,noframes,noscript,ol,output,p,pre,' +
      'section,table,tbody,td,tfoot,th,thead,tr,ul,video' +
      ',applet' // added for WAT
    )

    const isInlineElement = MapOf(
      'a,abbr,acronym,Applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,' +
      'font,i,iframe,img,input,ins,kbd,label,map,Object,q,s,samp,Script,select,' +
      'small,span,strike,strong,sub,sup,textarea,tt,u,var'
    )

    const isSelfClosingElement = MapOf(
      'area,base,basefont,bgsound,br,col,colgroup,dd,dt,embed,frame,hr,img,' +
      'input,isIndex,keygen,li,link,menuitem,meta,options,p,param,source,td,' +
      'tfoot,th,thead,tr,track,wbr'
    )

    const isSpecialElement = MapOf(
      'script,style'
    )

    const isKeywordAttribute = MapOf(
      'checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,' +
      'noshade,nowrap,readonly,selected'
    )

  /**** actual HTML parser ****/

    let doNothing = function ():void {}

    let processStartTag = Callbacks.processStartTag || doNothing
    let processEndTag   = Callbacks.processEndTag   || doNothing
    let processText     = Callbacks.processText     || doNothing
    let processComment  = Callbacks.processComment  || doNothing

// @ts-ignore "Stack.last" will be defined just one line later
    let Stack:TagStack = []    // Stack with tag names of unclosed HTML elements
      Stack.last = function last ():string|undefined { return this[this.length-1] }

    function parseStartTag (
      _:any, TagName:string, rest:string, isUnary?:boolean
    ):string {
      TagName = TagName.toLowerCase()

      if (isBlockElement[TagName]) {            // close pending inline elements
        while ((Stack.last() != null) && isInlineElement[Stack.last() as string]) {
          parseEndTag('', Stack.last())
        }
      }

      if (isSelfClosingElement[TagName] && (Stack.last() === TagName)) {
        parseEndTag('', TagName)
      }

      isUnary = isEmptyElement[TagName] || !!isUnary
      if (! isUnary) { Stack.push(TagName) }

      if (processStartTag !== doNothing) {
        let Attributes:any[] = []
          rest.replace(AttributePattern, function(Match:any, AttributeName:string):string {
            let AttributeValue:string = (arguments[2] ? arguments[2] :
              arguments[3] ? arguments[3] :
                arguments[4] ? arguments[4] :
                  isKeywordAttribute[AttributeName] ? AttributeName : '')
            Attributes.push({
              Name:AttributeName, Value:AttributeValue,
              escapedValue:AttributeValue.replace(/(^|[^\\])"/g, '$1\\\"')
            })
            return ''
          })
        processStartTag(
          TagName, Attributes, isUnary, (Stack.length === (isUnary ? 0 : 1))
        )
      }

      return ''
    }

    function parseEndTag (_?:any, TagName?:string):string {
      let Position;                 // how many open elements have to be closed?
      if (TagName == null) {
        Position = 0
      } else {
        TagName = TagName.toLowerCase()

        for (Position = Stack.length-1; Position >= 0; Position--) {
          if (Stack[Position] === TagName) { break }
        }
      }

      if (Position >= 0) {
        for (let i = Stack.length-1; i >= Position; i--) {
          processEndTag(Stack[i], (i === 0))
        }
        Stack.length = Position
      }

      return ''
    }

    let lastHTMLContent = HTML
    while (HTML !== '') {
      let inText = true

      if ((Stack.last() == null) || ! isSpecialElement[Stack.last() as string]) {
        if (HTML.startsWith('<!--')) {                           // HTML comment
          let Index = HTML.indexOf('-->',4)
          if (Index > 0) {
            processComment(HTML.slice(4,Index))
            HTML    = HTML.slice(Index + 3)
            inText = false
          }
        } else if (HTML.startsWith('</')) {                      // HTML end tag
          let Match = HTML.match(EndTagPattern)
          if (Match != null) {
            HTML = HTML.slice(Match[0].length)
            Match[0].replace(EndTagPattern, parseEndTag);// for side effects
            inText = false
          }
        } else if (HTML.startsWith('<')) {                     // HTML start tag
          let Match = HTML.match(StartTagPattern)
          if (Match != null) {
            HTML = HTML.slice(Match[0].length)
            Match[0].replace(StartTagPattern, parseStartTag);// for side effects
            inText = false
          }
        }

        if (inText) {
          let Index = HTML.indexOf('<')

          let Text = (Index < 0 ? HTML : HTML.slice(0,Index))
          HTML     = (Index < 0 ? ''   : HTML.slice(Index))

          processText(Text, Stack.length === 0)
        }
      } else {
        HTML = HTML.replace(
          new RegExp('^((?:.|\n)*?)<\/' + Stack.last() + '[^>]*>','i'),
          function (_:any, Text:string):string {
            Text = Text
              .replace(/<!--(.*?)-->/g, '$1')
              .replace(/<!\[CDATA\[(.*?)]]>/g, '$1')
            processText(Text, Stack.length === 0)
            return ''
          }
        )
        parseEndTag('', Stack.last())
      }

      if (HTML === lastHTMLContent) {
        switch (true) {
          case HTML.startsWith('<'):
            HTML = HTML.slice(1)
            processText('&lt;', Stack.length === 0)
            break
          default:
            throwError('HTMLParseError: could not parse "' + HTML + '"')
        }
      }
      lastHTMLContent = HTML
    }
    parseEndTag()
  }

/**** AttributeFrom ****/

  function AttributeFrom (AttributeName:string, Attributes:any[]):string|undefined {
    for (let i = 0, l = Attributes.length; i < l; i++) {
      let Attribute = Attributes[i]
      if (Attribute.Name === AttributeName) { return Attribute.Value }
    }
    return undefined
  }

/**** deserializedTag ****/

  function deserializedTag (
    TagName:string, Attributes:HTMLAttribute[], isUnary:boolean
  ):string {
    let Result = '<' + TagName
      for (let i = 0, l = Attributes.length; i < l; i++) {
        let Attribute = Attributes[i]
        Result += ' ' + Attribute.Name + '="' + Attribute.escapedValue + '"'
      }
    return Result + (isUnary ? '/>' : '>')
  }


/**** escapedHTMLAttribute ****/

  function escapedHTMLAttribute (OriginalValue:string):string {
    return OriginalValue.replace(
      /[&<>"'\u0000-\u001F\u007F-\u009F\\]/g, function (Match) {
        switch (Match) {
          case '&':  return '&amp;'
          case '<':  return '&lt;'
          case '>':  return '&gt;'
          case '"':  return '&quot;'
          case "'":  return '&apos;'
          case '\n': return '\n'            // allows line feeds to be preserved
          case '\\': return '&#92;'
          default:   let Result = Match.charCodeAt(0).toString(16)
                     return '&#x0000'.substring(3,7-Result.length) + Result + ';'
        }
      }
    )
  }



/**** saveToFile - the actual, complete preprocessor ****/

  function saveToFile (FileName:string):Preprocessor {
    expectNonEmptyString('name of the file to save to',FileName)

    let processedScript:string = ''
    let processedMarkup:string = ''
    let processedStyle:string  = ''

  /**** processScript ****/

    function processScript (input: {
      attributes:Record<string,string>, content:string
    }):PreprocessorResult {
      let { attributes,content } = input

      if (ValueIsNonEmptyString(content)) {
        processedScript = '<script'
          for (let Key in attributes) {
            if (attributes.hasOwnProperty(Key) && (Key !== 'lang')) {
              processedScript += (
                ' ' + Key + '=' + escapedHTMLAttribute(attributes[Key])
              )
            }
          }
        processedScript += '>\n'
          content = content.replace(/^\s*\n/,'').replace(/\n\s*$/,'')
          processedScript += content     // w/o leading and trailing empty lines
        processedScript += '\n</script>'
      }
      return Promise.resolve({ code:content })
    }


  /**** processMarkup ****/

    function processMarkup (input: { content:string }):PreprocessorResult {
      let { content } = input

      if (ValueIsNonEmptyString(content)) {
        let HTMLParserCallbacks = {
          processStartTag: function processStartTag (
            TagName:string, Attributes:HTMLAttribute[], isUnary:boolean, isTopLevel:boolean
          ) {
            if (! isTopLevel || ((TagName !== 'style') && (TagName !== 'script'))) {
              processedMarkup += deserializedTag(TagName,Attributes,isUnary)
            }
          },
          processEndTag: function processEndTag (TagName:string, isTopLevel:boolean) {
            if (! isTopLevel || ((TagName !== 'style') && (TagName !== 'script'))) {
              processedMarkup += '</' + TagName + '>'
            }
          },
          processText: function processText (Text:string, isTopLevel:boolean) {
            processedMarkup += Text
          },
          processComment: function processComment (Comment:string) {
            processedMarkup += Comment
          }
        }

        parseHTML(content, HTMLParserCallbacks)

        if (ValueIsEmptyString(processedMarkup)) {
          processedMarkup = ''
        }
      }

      return Promise.resolve({ code:content })
    }


  /**** processStyle ****/

    function processStyle (input: {
      attributes:Record<string,string>, content:string
    }):PreprocessorResult {
      let { attributes,content } = input

      if (ValueIsNonEmptyString(content)) {
        processedStyle = '<style'
          for (let Key in attributes) {
            if (attributes.hasOwnProperty(Key) && (Key !== 'lang')) {
              processedStyle += (
                ' ' + Key + '=' + escapedHTMLAttribute(attributes[Key])
              )
            }
          }
        processedStyle += '>\n'
          content = content.replace(/^\s*\n/,'').replace(/\n\s*$/,'')
          processedStyle += content      // w/o leading and trailing empty lines
        processedStyle += '\n</style>'
      }

    /**** now it's time to write anything into the given file ****>

      let completeFilename = path.join(process.cwd(),FileName)
      fs.writeFileSync(completeFilename, (
        (processedStyle  === '' ? '' : processedStyle  + '\n') +
        (processedScript === '' ? '' : processedScript + '\n') +
        (processedMarkup === '' ? '' : processedMarkup + '\n')
      ))

    /**** that's it! ****/

      return Promise.resolve({ code:content })
    }

    return { markup:processMarkup, script:processScript, style:processStyle }
  }
  export default saveToFile
