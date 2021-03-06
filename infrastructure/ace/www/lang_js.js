/**
 * Copyright 2009 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

grammars = (window.grammars || {});
grammars["source.js"] = (function() {
    var rxTest = function(str, rx, startIndex) {
        rx.lastIndex = startIndex;
        var rslt = rx.exec(str);
        return !!(rslt && rslt[0]);
    };
    var tokenizeMatch = function(str, startIndex, rxResult, captureNames, captureGroups, captureLocators, captureStructure, tokenFunc, extraScopes) {
        extraScopes = (extraScopes && " " + extraScopes);
        // each entry of scopeState is undefined or a scope starting with a " ", so that
        // that when the array is joined on '' it is either an empty string or series of
        // space-separated scopes starting with an extra space
        var scopeState = new Array(captureNames.length + 1);
        var idx = startIndex;
        var fullLen = rxResult[0].length;
        for (var k = 0; k < captureStructure.length; k++) {
            var c = captureStructure[k];
            var g = captureGroups[c];
            if (g < 0) continue;
            var isOpen = (scopeState[c] === undefined);
            var newIndex = startIndex + fullLen;
            var locators = captureLocators[c];
            for (var j = 0; j < locators.length; j++) newIndex -= (rxResult[locators[j]] || '').length;
            if (isOpen) {
                newIndex -= (rxResult[g] || '').length;
            }
            if (newIndex > idx) {
                tokenFunc(str.substring(idx, newIndex), (extraScopes + scopeState.join('')).substring(1));
            }
            idx = newIndex;
            if (isOpen) {
                scopeState[c] = " " + captureNames[c];
            }
            else {
                delete scopeState[c];
            }
        }
        if (idx < startIndex + fullLen) {
            tokenFunc(str.substring(idx, startIndex + fullLen), (extraScopes + scopeState.join('')).substring(1));
        }
    };
    var tryMatch = function(str, startIndex, rx, fgn, captureNames, captureGroups, captureLocators, captureStructure, tokenFunc, extraScopes, optOnBeforeTokenize) {
        rx.lastIndex = startIndex;
        var rxResult = rx.exec(str);
        if (! rxResult) return false; // shouldn't happen
        if (rxResult[fgn]) return false; // failure group
        optOnBeforeTokenize && optOnBeforeTokenize();
        tokenizeMatch(str, startIndex, rxResult, captureNames, captureGroups, captureLocators, captureStructure, tokenFunc, extraScopes);
        return [rxResult[0].length];
    };
    var tryMatch2 = function(str, startIndex, postlob, captureNames, captureStructure, tokenFunc, extraScopes, optOnBeforeTokenize) {
        return(postlob ? tryMatch(str, startIndex, postlob[0], postlob[1], captureNames, postlob[2], postlob[3], captureStructure, tokenFunc, extraScopes, optOnBeforeTokenize) : false);
    }
    var rxs = [/(?=\n)|"|([\s\S])/g,/\\(x[0-9a-fA-F]{2}|[0-2][0-7]{0,2}|3[0-6][0-7]|37[0-7]?|[4-7][0-7]?|.)|([\s\S])/g,/([a-zA-Z_\?\.\$][\w\?\.\$]*)(\.(prototype)(\s*(=)(\s*)))|([\s\S])/g,/([a-zA-Z_\?\.\$][\w\?\.\$]*)(\.(prototype)(\.([a-zA-Z_\?\.\$][\w\?\.\$]*)(\s*(=)(\s*(function)?(\s*(\()((.*?)(\))))))))|([\s\S])/g,/([a-zA-Z_\?\.\$][\w\?\.\$]*)(\.(prototype)(\.([a-zA-Z_\?\.\$][\w\?\.\$]*)(\s*(=)(\s*))))|([\s\S])/g,/([a-zA-Z_\?\.\$][\w\?\.\$]*)(\.([a-zA-Z_\?\.\$][\w\?\.\$]*)(\s*(=)(\s*(function)(\s*(\()((.*?)(\)))))))|([\s\S])/g,/([a-zA-Z_\?\$][\w\?\$]*)(\s*(=)(\s*(function)(\s*(\()((.*?)(\))))))|([\s\S])/g,/\b(function)(\s+([a-zA-Z_\$]\w*)?(\s*(\()((.*?)(\)))))|([\s\S])/g,/\b([a-zA-Z_\?\.\$][\w\?\.\$]*)(\s*:\s*\b(function)?(\s*(\()((.*?)(\)))))|([\s\S])/g,/(?:((')((.*?)(')))|((")((.*?)("))))(\s*:\s*\b(function)?(\s*(\()((.*?)(\)))))|([\s\S])/g,/(new)(\s+(\w+(?:\.\w*)?))|([\s\S])/g,/\b(console)\b|([\s\S])/g,/\.(warn|info|log|error|time|timeEnd|assert)\b|([\s\S])/g,/\b((0(x|X)[0-9a-fA-F]+)|([0-9]+(\.[0-9]+)?))\b|([\s\S])/g,/'|([\s\S])/g,/"|([\s\S])/g,/\/\*\*(?!\/)|([\s\S])/g,/\/\*|([\s\S])/g,/(\/\/)(.*(?=\n)\n?)|([\s\S])/g,/(<!\-\-|\-\->)|([\s\S])/g,/\b(boolean|byte|char|class|double|enum|float|function|int|interface|long|short|var|void)\b|([\s\S])/g,/\b(const|export|extends|final|implements|native|private|protected|public|static|synchronized|throws|transient|volatile)\b|([\s\S])/g,/\b(break|case|catch|continue|default|do|else|finally|for|goto|if|import|package|return|switch|throw|try|while)\b|([\s\S])/g,/\b(delete|in|instanceof|new|typeof|with)\b|([\s\S])/g,/\btrue\b|([\s\S])/g,/\bfalse\b|([\s\S])/g,/\bnull\b|([\s\S])/g,/\b(super|this)\b|([\s\S])/g,/\b(debugger)\b|([\s\S])/g,/\b(Anchor|Applet|Area|Array|Boolean|Button|Checkbox|Date|document|event|FileUpload|Form|Frame|Function|Hidden|History|Image|JavaArray|JavaClass|JavaObject|JavaPackage|java|Layer|Link|Location|Math|MimeType|Number|navigator|netscape|Object|Option|Packages|Password|Plugin|Radio|RegExp|Reset|Select|String|Style|Submit|screen|sun|Text|Textarea|window|XMLHttpRequest)\b|([\s\S])/g,/\b(s(h(ift|ow(Mod(elessDialog|alDialog)|Help))|croll(X|By(Pages|Lines)?|Y|To)?|t(op|rike)|i(n|zeToContent|debar|gnText)|ort|u(p|b(str(ing)?)?)|pli(ce|t)|e(nd|t(Re(sizable|questHeader)|M(i(nutes|lliseconds)|onth)|Seconds|Ho(tKeys|urs)|Year|Cursor|Time(out)?|Interval|ZOptions|Date|UTC(M(i(nutes|lliseconds)|onth)|Seconds|Hours|Date|FullYear)|FullYear|Active)|arch)|qrt|lice|avePreferences|mall)|h(ome|andleEvent)|navigate|c(har(CodeAt|At)|o(s|n(cat|textual|firm)|mpile)|eil|lear(Timeout|Interval)?|a(ptureEvents|ll)|reate(StyleSheet|Popup|EventObject))|t(o(GMTString|S(tring|ource)|U(TCString|pperCase)|Lo(caleString|werCase))|est|a(n|int(Enabled)?))|i(s(NaN|Finite)|ndexOf|talics)|d(isableExternalCapture|ump|etachEvent)|u(n(shift|taint|escape|watch)|pdateCommands)|j(oin|avaEnabled)|p(o(p|w)|ush|lugins.refresh|a(ddings|rse(Int|Float)?)|r(int|ompt|eference))|e(scape|nableExternalCapture|val|lementFromPoint|x(p|ec(Script|Command)?))|valueOf|UTC|queryCommand(State|Indeterm|Enabled|Value)|f(i(nd|le(ModifiedDate|Size|CreatedDate|UpdatedDate)|xed)|o(nt(size|color)|rward)|loor|romCharCode)|watch|l(ink|o(ad|g)|astIndexOf)|a(sin|nchor|cos|t(tachEvent|ob|an(2)?)|pply|lert|b(s|ort))|r(ou(nd|teEvents)|e(size(By|To)|calc|turnValue|place|verse|l(oad|ease(Capture|Events)))|andom)|g(o|et(ResponseHeader|M(i(nutes|lliseconds)|onth)|Se(conds|lection)|Hours|Year|Time(zoneOffset)?|Da(y|te)|UTC(M(i(nutes|lliseconds)|onth)|Seconds|Hours|Da(y|te)|FullYear)|FullYear|A(ttention|llResponseHeaders)))|m(in|ove(B(y|elow)|To(Absolute)?|Above)|ergeAttributes|a(tch|rgins|x))|b(toa|ig|o(ld|rderWidths)|link|ack))\b(?=\()|([\s\S])/g,/\b(s(ub(stringData|mit)|plitText|e(t(NamedItem|Attribute(Node)?)|lect))|has(ChildNodes|Feature)|namedItem|c(l(ick|o(se|neNode))|reate(C(omment|DATASection|aption)|T(Head|extNode|Foot)|DocumentFragment|ProcessingInstruction|E(ntityReference|lement)|Attribute))|tabIndex|i(nsert(Row|Before|Cell|Data)|tem)|open|delete(Row|C(ell|aption)|T(Head|Foot)|Data)|focus|write(ln)?|a(dd|ppend(Child|Data))|re(set|place(Child|Data)|move(NamedItem|Child|Attribute(Node)?)?)|get(NamedItem|Element(sBy(Name|TagName)|ById)|Attribute(Node)?)|blur)\b(?=\()|([\s\S])/g,/\.|/g,/(s(ystemLanguage|cr(ipts|ollbars|een(X|Y|Top|Left))|t(yle(Sheets)?|atus(Text|bar)?)|ibling(Below|Above)|ource|uffixes|e(curity(Policy)?|l(ection|f)))|h(istory|ost(name)?|as(h|Focus))|y|X(MLDocument|SLDocument)|n(ext|ame(space(s|URI)|Prop))|M(IN_VALUE|AX_VALUE)|c(haracterSet|o(n(structor|trollers)|okieEnabled|lorDepth|mp(onents|lete))|urrent|puClass|l(i(p(boardData)?|entInformation)|osed|asses)|alle(e|r)|rypto)|t(o(olbar|p)|ext(Transform|Indent|Decoration|Align)|ags)|SQRT(1_2|2)|i(n(ner(Height|Width)|put)|ds|gnoreCase)|zIndex|o(scpu|n(readystatechange|Line)|uter(Height|Width)|p(sProfile|ener)|ffscreenBuffering)|NEGATIVE_INFINITY|d(i(splay|alog(Height|Top|Width|Left|Arguments)|rectories)|e(scription|fault(Status|Ch(ecked|arset)|View)))|u(ser(Profile|Language|Agent)|n(iqueID|defined)|pdateInterval)|_content|p(ixelDepth|ort|ersonalbar|kcs11|l(ugins|atform)|a(thname|dding(Right|Bottom|Top|Left)|rent(Window|Layer)?|ge(X(Offset)?|Y(Offset)?))|r(o(to(col|type)|duct(Sub)?|mpter)|e(vious|fix)))|e(n(coding|abledPlugin)|x(ternal|pando)|mbeds)|v(isibility|endor(Sub)?|Linkcolor)|URLUnencoded|P(I|OSITIVE_INFINITY)|f(ilename|o(nt(Size|Family|Weight)|rmName)|rame(s|Element)|gColor)|E|whiteSpace|l(i(stStyleType|n(eHeight|kColor))|o(ca(tion(bar)?|lName)|wsrc)|e(ngth|ft(Context)?)|a(st(M(odified|atch)|Index|Paren)|yer(s|X)|nguage))|a(pp(MinorVersion|Name|Co(deName|re)|Version)|vail(Height|Top|Width|Left)|ll|r(ity|guments)|Linkcolor|bove)|r(ight(Context)?|e(sponse(XML|Text)|adyState))|global|x|m(imeTypes|ultiline|enubar|argin(Right|Bottom|Top|Left))|L(N(10|2)|OG(10E|2E))|b(o(ttom|rder(RightWidth|BottomWidth|Style|Color|TopWidth|LeftWidth))|ufferDepth|elow|ackground(Color|Image)))\b|([\s\S])/g,/(s(hape|ystemId|c(heme|ope|rolling)|ta(ndby|rt)|ize|ummary|pecified|e(ctionRowIndex|lected(Index)?)|rc)|h(space|t(tpEquiv|mlFor)|e(ight|aders)|ref(lang)?)|n(o(Resize|tation(s|Name)|Shade|Href|de(Name|Type|Value)|Wrap)|extSibling|ame)|c(h(ildNodes|Off|ecked|arset)?|ite|o(ntent|o(kie|rds)|de(Base|Type)?|l(s|Span|or)|mpact)|ell(s|Spacing|Padding)|l(ear|assName)|aption)|t(ype|Bodies|itle|Head|ext|a(rget|gName)|Foot)|i(sMap|ndex|d|m(plementation|ages))|o(ptions|wnerDocument|bject)|d(i(sabled|r)|o(c(type|umentElement)|main)|e(clare|f(er|ault(Selected|Checked|Value)))|at(eTime|a))|useMap|p(ublicId|arentNode|r(o(file|mpt)|eviousSibling))|e(n(ctype|tities)|vent|lements)|v(space|ersion|alue(Type)?|Link|Align)|URL|f(irstChild|orm(s)?|ace|rame(Border)?)|width|l(ink(s)?|o(ngDesc|wSrc)|a(stChild|ng|bel))|a(nchors|c(ce(ssKey|pt(Charset)?)|tion)|ttributes|pplets|l(t|ign)|r(chive|eas)|xis|Link|bbr)|r(ow(s|Span|Index)|ules|e(v|ferrer|l|adOnly))|m(ultiple|e(thod|dia)|a(rgin(Height|Width)|xLength))|b(o(dy|rder)|ackground|gColor))\b|([\s\S])/g,/\b(ELEMENT_NODE|ATTRIBUTE_NODE|TEXT_NODE|CDATA_SECTION_NODE|ENTITY_REFERENCE_NODE|ENTITY_NODE|PROCESSING_INSTRUCTION_NODE|COMMENT_NODE|DOCUMENT_NODE|DOCUMENT_TYPE_NODE|DOCUMENT_FRAGMENT_NODE|NOTATION_NODE|INDEX_SIZE_ERR|DOMSTRING_SIZE_ERR|HIERARCHY_REQUEST_ERR|WRONG_DOCUMENT_ERR|INVALID_CHARACTER_ERR|NO_DATA_ALLOWED_ERR|NO_MODIFICATION_ALLOWED_ERR|NOT_FOUND_ERR|NOT_SUPPORTED_ERR|INUSE_ATTRIBUTE_ERR)\b|([\s\S])/g,/\bon(R(ow(s(inserted|delete)|e(nter|xit))|e(s(ize(start|end)?|et)|adystatechange))|Mouse(o(ut|ver)|down|up|move)|B(efore(cut|deactivate|u(nload|pdate)|p(aste|rint)|editfocus|activate)|lur)|S(croll|top|ubmit|elect(start|ionchange)?)|H(over|elp)|C(hange|ont(extmenu|rolselect)|ut|ellchange|l(ick|ose))|D(eactivate|ata(setc(hanged|omplete)|available)|r(op|ag(start|over|drop|en(ter|d)|leave)?)|blclick)|Unload|P(aste|ropertychange)|Error(update)?|Key(down|up|press)|Focus|Load|A(ctivate|fter(update|print)|bort))\b|([\s\S])/g,/\(|/g,/!|\$|%|&|\*|\-\-|\-|\+\+|\+|~|===|==|=|!=|!==|<=|>=|<<=|>>=|>>>=|<>|<|>|!|&&|\|\||\?:|\*=|\/=|%=|\+=|\-=|&=|\^=|\b(in|instanceof|new|delete|typeof|void)\b|([\s\S])/g,/!|\$|%|&|\*|\-\-|\-|\+\+|\+|~|===|==|=|!=|!==|<=|>=|<<=|>>=|>>>=|<>|<|>|!|&&|\|\||\?:|\*=|%=|\+=|\-=|&=|\^=|\b(in|instanceof|new|delete|typeof|void)\b|([\s\S])/g,/\b(Infinity|NaN|undefined)\b|([\s\S])/g,/^[\s\S]|/g,/[=\(:]|/g,/return|/g,/\s*(\/)((?![\/\*\+\{\}\?]))|([\s\S])/g,/;|([\s\S])/g,/,[ \|\t]*|([\s\S])/g,/\.|([\s\S])/g,/\{|\}|([\s\S])/g,/\(|\)|([\s\S])/g,/\[|\]|([\s\S])/g,/(?=\n)|(\/)([igm]*)|([\s\S])/g,/\\.|([\s\S])/g,/\*\/|([\s\S])/g,/(?=\n)|'|([\s\S])/g,/\\(x[0-9a-fA-F]{2}|[0-2][0-7]{0,2}|3[0-6][0-7]?|37[0-7]?|[4-7][0-7]?|.)|([\s\S])/g];
    var exs = [
        [rxs[0],1,[0],[
            []
        ]],
        [rxs[1],2,[],[]],
        [rxs[2],7,[1,3,5],[
            [2],
            [4],
            [6]
        ]],
        [rxs[3],15,[1,3,5,7,9,11,13,14],[
            [2],
            [4],
            [6],
            [8],
            [10],
            [12],
            [14],
            []
        ]],
        [rxs[4],9,[1,3,5,7],[
            [2],
            [4],
            [6],
            [8]
        ]],
        [rxs[5],13,[1,3,5,7,9,11,12],[
            [2],
            [4],
            [6],
            [8],
            [10],
            [12],
            []
        ]],
        [rxs[6],11,[1,3,5,7,9,10],[
            [2],
            [4],
            [6],
            [8],
            [10],
            []
        ]],
        [rxs[7],9,[1,3,5,7,8],[
            [2],
            [4],
            [6],
            [8],
            []
        ]],
        [rxs[8],9,[1,3,5,7,8],[
            [2],
            [4],
            [6],
            [8],
            []
        ]],
        [rxs[9],18,[1,2,4,5,6,7,9,10,12,14,16,17],[
            [11],
            [3,11],
            [5,11],
            [11],
            [11],
            [8,11],
            [10,11],
            [11],
            [13],
            [15],
            [17],
            []
        ]],
        [rxs[10],4,[1,3],[
            [2],
            []
        ]],
        [rxs[11],2,[],[]],
        [rxs[12],2,[],[]],
        [rxs[13],6,[],[]],
        [rxs[14],1,[0],[
            []
        ]],
        [rxs[15],1,[0],[
            []
        ]],
        [rxs[16],1,[0],[
            []
        ]],
        [rxs[17],1,[0],[
            []
        ]],
        [rxs[18],3,[1],[
            [2]
        ]],
        [rxs[19],2,[1],[
            []
        ]],
        [rxs[20],2,[],[]],
        [rxs[21],2,[],[]],
        [rxs[22],2,[],[]],
        [rxs[23],2,[],[]],
        [rxs[24],1,[],[]],
        [rxs[25],1,[],[]],
        [rxs[26],1,[],[]],
        [rxs[27],2,[],[]],
        [rxs[28],2,[],[]],
        [rxs[29],2,[],[]],
        [rxs[30],90,[],[]],
        [rxs[31],31,[],[]],
        [rxs[33],101,[],[]],
        [rxs[34],65,[],[]],
        [rxs[35],2,[],[]],
        [rxs[36],32,[],[]],
        [rxs[38],2,[],[]],
        [rxs[39],2,[],[]],
        [rxs[40],2,[],[]],
        [rxs[44],3,[1],[
            [2]
        ]],
        [rxs[45],1,[],[]],
        [rxs[46],1,[],[]],
        [rxs[47],1,[],[]],
        [rxs[48],1,[],[]],
        [rxs[49],1,[],[]],
        [rxs[50],1,[],[]],
        [rxs[51],3,[1],[
            [2]
        ]],
        [rxs[52],1,[],[]],
        [rxs[53],1,[0],[
            []
        ]],
        [rxs[53],1,[0],[
            []
        ]],
        [rxs[54],1,[0],[
            []
        ]],
        [rxs[55],2,[],[]]
    ];
    var frames = {3: ({ scopes:"string.quoted.double.js", go:function(str, startIndex, tokenFunc0, frameStack, scopeStack, optOnMatch) {
        var tokenFunc = function(txt, scps) {
            tokenFunc0(txt, (scopeStack.join('') + (scps && ' ' + scps)).substring(1));
        };
        var matchResult;
        if ((matchResult = tryMatch2(str, startIndex, exs[0], ["punctuation.definition.string.end.js"], [0,0], tokenFunc, "string.quoted.double.js", (function() {
            (optOnMatch && optOnMatch());
            frameStack.pop();
            scopeStack.pop();
        })))) {
        } else if ((matchResult = tryMatch2(str, startIndex, exs[1], [], [], tokenFunc, "constant.character.escape.js", optOnMatch))) {
        } else {
            return false;
        }
        return matchResult;
    } }),1: ({ scopes:"source.js", go:function(str, startIndex, tokenFunc0, frameStack, scopeStack, optOnMatch) {
        var tokenFunc = function(txt, scps) {
            tokenFunc0(txt, (scopeStack.join('') + (scps && ' ' + scps)).substring(1));
        };
        var matchResult;
        if ((matchResult = tryMatch2(str, startIndex, exs[2], ["support.class.js","support.constant.js","keyword.operator.js"], [0,0,1,1,2,2], tokenFunc, "meta.class.js", optOnMatch))) {
        } else if ((matchResult = tryMatch2(str, startIndex, exs[3], ["support.class.js","support.constant.js","entity.name.function.js","keyword.operator.js","storage.type.function.js","punctuation.definition.parameters.begin.js","variable.parameter.function.js","punctuation.definition.parameters.end.js"], [0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7], tokenFunc, "meta.function.prototype.js", optOnMatch))) {
        } else if ((matchResult = tryMatch2(str, startIndex, exs[4], ["support.class.js","support.constant.js","entity.name.function.js","keyword.operator.js"], [0,0,1,1,2,2,3,3], tokenFunc, "meta.function.js", optOnMatch))) {
        } else if ((matchResult = tryMatch2(str, startIndex, exs[5], ["support.class.js","entity.name.function.js","keyword.operator.js","storage.type.function.js","punctuation.definition.parameters.begin.js","variable.parameter.function.js","punctuation.definition.parameters.end.js"], [0,0,1,1,2,2,3,3,4,4,5,5,6,6], tokenFunc, "meta.function.js", optOnMatch))) {
        } else if ((matchResult = tryMatch2(str, startIndex, exs[6], ["entity.name.function.js","keyword.operator.js","storage.type.function.js","punctuation.definition.parameters.begin.js","variable.parameter.function.js","punctuation.definition.parameters.end.js"], [0,0,1,1,2,2,3,3,4,4,5,5], tokenFunc, "meta.function.js", optOnMatch))) {
        } else if ((matchResult = tryMatch2(str, startIndex, exs[7], ["storage.type.function.js","entity.name.function.js","punctuation.definition.parameters.begin.js","variable.parameter.function.js","punctuation.definition.parameters.end.js"], [0,0,1,1,2,2,3,3,4,4], tokenFunc, "meta.function.js", optOnMatch))) {
        } else if ((matchResult = tryMatch2(str, startIndex, exs[8], ["entity.name.function.js","storage.type.function.js","punctuation.definition.parameters.begin.js","variable.parameter.function.js","punctuation.definition.parameters.end.js"], [0,0,1,1,2,2,3,3,4,4], tokenFunc, "meta.function.json.js", optOnMatch))) {
        } else if ((matchResult = tryMatch2(str, startIndex, exs[9], ["string.quoted.single.js","punctuation.definition.string.begin.js","entity.name.function.js","punctuation.definition.string.end.js","string.quoted.double.js","punctuation.definition.string.begin.js","entity.name.function.js","punctuation.definition.string.end.js","entity.name.function.js","punctuation.definition.parameters.begin.js","variable.parameter.function.js","punctuation.definition.parameters.end.js"], [0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,8,8,9,9,10,10,11,11], tokenFunc, "meta.function.json.js", optOnMatch))) {
        } else if ((matchResult = tryMatch2(str, startIndex, exs[10], ["keyword.operator.new.js","entity.name.type.instance.js"], [0,0,1,1], tokenFunc, "meta.class.instance.constructor", optOnMatch))) {
        } else if ((matchResult = tryMatch2(str, startIndex, exs[11], [], [], tokenFunc, "entity.name.type.object.js.firebug", optOnMatch))) {
        } else if ((matchResult = tryMatch2(str, startIndex, exs[12], [], [], tokenFunc, "support.function.js.firebug", optOnMatch))) {
        } else if ((matchResult = tryMatch2(str, startIndex, exs[13], [], [], tokenFunc, "constant.numeric.js", optOnMatch))) {
        } else if ((matchResult = tryMatch2(str, startIndex, exs[14], ["punctuation.definition.string.begin.js"], [0,0], tokenFunc, "string.quoted.single.js", optOnMatch))) {
            frameStack.push(2);
            scopeStack.push(" string.quoted.single.js");
        } else if ((matchResult = tryMatch2(str, startIndex, exs[15], ["punctuation.definition.string.begin.js"], [0,0], tokenFunc, "string.quoted.double.js", optOnMatch))) {
            frameStack.push(3);
            scopeStack.push(" string.quoted.double.js");
        } else if ((matchResult = tryMatch2(str, startIndex, exs[16], ["punctuation.definition.comment.js"], [0,0], tokenFunc, "comment.block.documentation.js", optOnMatch))) {
            frameStack.push(4);
            scopeStack.push(" comment.block.documentation.js");
        } else if ((matchResult = tryMatch2(str, startIndex, exs[17], ["punctuation.definition.comment.js"], [0,0], tokenFunc, "comment.block.js", optOnMatch))) {
            frameStack.push(5);
            scopeStack.push(" comment.block.js");
        } else if ((matchResult = tryMatch2(str, startIndex, exs[18], ["punctuation.definition.comment.js"], [0,0], tokenFunc, "comment.line.double-slash.js", optOnMatch))) {
        } else if ((matchResult = tryMatch2(str, startIndex, exs[19], ["punctuation.definition.comment.html.js"], [0,0], tokenFunc, "comment.block.html.js", optOnMatch))) {
        } else if ((matchResult = tryMatch2(str, startIndex, exs[20], [], [], tokenFunc, "storage.type.js", optOnMatch))) {
        } else if ((matchResult = tryMatch2(str, startIndex, exs[21], [], [], tokenFunc, "storage.modifier.js", optOnMatch))) {
        } else if ((matchResult = tryMatch2(str, startIndex, exs[22], [], [], tokenFunc, "keyword.control.js", optOnMatch))) {
        } else if ((matchResult = tryMatch2(str, startIndex, exs[23], [], [], tokenFunc, "keyword.operator.js", optOnMatch))) {
        } else if ((matchResult = tryMatch2(str, startIndex, exs[24], [], [], tokenFunc, "constant.language.boolean.true.js", optOnMatch))) {
        } else if ((matchResult = tryMatch2(str, startIndex, exs[25], [], [], tokenFunc, "constant.language.boolean.false.js", optOnMatch))) {
        } else if ((matchResult = tryMatch2(str, startIndex, exs[26], [], [], tokenFunc, "constant.language.null.js", optOnMatch))) {
        } else if ((matchResult = tryMatch2(str, startIndex, exs[27], [], [], tokenFunc, "variable.language.js", optOnMatch))) {
        } else if ((matchResult = tryMatch2(str, startIndex, exs[28], [], [], tokenFunc, "keyword.other.js", optOnMatch))) {
        } else if ((matchResult = tryMatch2(str, startIndex, exs[29], [], [], tokenFunc, "support.class.js", optOnMatch))) {
        } else if ((matchResult = tryMatch2(str, startIndex, exs[30], [], [], tokenFunc, "support.function.js", optOnMatch))) {
        } else if ((matchResult = tryMatch2(str, startIndex, exs[31], [], [], tokenFunc, "support.function.dom.js", optOnMatch))) {
        } else if ((matchResult = tryMatch2(str, startIndex, (rxTest(str, rxs[32], (startIndex - 1)) ? exs[32] : null), [], [], tokenFunc, "support.constant.js", optOnMatch))) {
        } else if ((matchResult = tryMatch2(str, startIndex, (rxTest(str, rxs[32], (startIndex - 1)) ? exs[33] : null), [], [], tokenFunc, "support.constant.dom.js", optOnMatch))) {
        } else if ((matchResult = tryMatch2(str, startIndex, exs[34], [], [], tokenFunc, "support.constant.dom.js", optOnMatch))) {
        } else if ((matchResult = tryMatch2(str, startIndex, exs[35], [], [], tokenFunc, "support.function.event-handler.js", optOnMatch))) {
        } else if ((matchResult = tryMatch2(str, startIndex, ((! rxTest(str, rxs[37], (startIndex - 1))) ? exs[36] : exs[37]), [], [], tokenFunc, "keyword.operator.js", optOnMatch))) {
        } else if ((matchResult = tryMatch2(str, startIndex, exs[38], [], [], tokenFunc, "constant.language.js", optOnMatch))) {
        } else if ((matchResult = tryMatch2(str, startIndex, (((rxTest(str, rxs[41], (startIndex - 0)) || rxTest(str, rxs[42], (startIndex - 1))) || rxTest(str, rxs[43], (startIndex - 6))) ? exs[39] : null), ["punctuation.definition.string.begin.js"], [0,0], tokenFunc, "string.regexp.js", optOnMatch))) {
            frameStack.push(6);
            scopeStack.push(" string.regexp.js");
        } else if ((matchResult = tryMatch2(str, startIndex, exs[40], [], [], tokenFunc, "punctuation.terminator.statement.js", optOnMatch))) {
        } else if ((matchResult = tryMatch2(str, startIndex, exs[41], [], [], tokenFunc, "meta.delimiter.object.comma.js", optOnMatch))) {
        } else if ((matchResult = tryMatch2(str, startIndex, exs[42], [], [], tokenFunc, "meta.delimiter.method.period.js", optOnMatch))) {
        } else if ((matchResult = tryMatch2(str, startIndex, exs[43], [], [], tokenFunc, "meta.brace.curly.js", optOnMatch))) {
        } else if ((matchResult = tryMatch2(str, startIndex, exs[44], [], [], tokenFunc, "meta.brace.round.js", optOnMatch))) {
        } else if ((matchResult = tryMatch2(str, startIndex, exs[45], [], [], tokenFunc, "meta.brace.square.js", optOnMatch))) {
        } else {
            return false;
        }
        return matchResult;
    } }),6: ({ scopes:"string.regexp.js", go:function(str, startIndex, tokenFunc0, frameStack, scopeStack, optOnMatch) {
        var tokenFunc = function(txt, scps) {
            tokenFunc0(txt, (scopeStack.join('') + (scps && ' ' + scps)).substring(1));
        };
        var matchResult;
        if ((matchResult = tryMatch2(str, startIndex, exs[46], ["punctuation.definition.string.end.js"], [0,0], tokenFunc, "string.regexp.js", (function() {
            (optOnMatch && optOnMatch());
            frameStack.pop();
            scopeStack.pop();
        })))) {
        } else if ((matchResult = tryMatch2(str, startIndex, exs[47], [], [], tokenFunc, "constant.character.escape.js", optOnMatch))) {
        } else {
            return false;
        }
        return matchResult;
    } }),4: ({ scopes:"comment.block.documentation.js", go:function(str, startIndex, tokenFunc0, frameStack, scopeStack, optOnMatch) {
        var tokenFunc = function(txt, scps) {
            tokenFunc0(txt, (scopeStack.join('') + (scps && ' ' + scps)).substring(1));
        };
        var matchResult;
        if ((matchResult = tryMatch2(str, startIndex, exs[48], ["punctuation.definition.comment.js"], [0,0], tokenFunc, "comment.block.documentation.js", (function() {
            (optOnMatch && optOnMatch());
            frameStack.pop();
            scopeStack.pop();
        })))) {
        } else {
            return false;
        }
        return matchResult;
    } }),5: ({ scopes:"comment.block.js", go:function(str, startIndex, tokenFunc0, frameStack, scopeStack, optOnMatch) {
        var tokenFunc = function(txt, scps) {
            tokenFunc0(txt, (scopeStack.join('') + (scps && ' ' + scps)).substring(1));
        };
        var matchResult;
        if ((matchResult = tryMatch2(str, startIndex, exs[49], ["punctuation.definition.comment.js"], [0,0], tokenFunc, "comment.block.js", (function() {
            (optOnMatch && optOnMatch());
            frameStack.pop();
            scopeStack.pop();
        })))) {
        } else {
            return false;
        }
        return matchResult;
    } }),2: ({ scopes:"string.quoted.single.js", go:function(str, startIndex, tokenFunc0, frameStack, scopeStack, optOnMatch) {
        var tokenFunc = function(txt, scps) {
            tokenFunc0(txt, (scopeStack.join('') + (scps && ' ' + scps)).substring(1));
        };
        var matchResult;
        if ((matchResult = tryMatch2(str, startIndex, exs[50], ["punctuation.definition.string.end.js"], [0,0], tokenFunc, "string.quoted.single.js", (function() {
            (optOnMatch && optOnMatch());
            frameStack.pop();
            scopeStack.pop();
        })))) {
        } else if ((matchResult = tryMatch2(str, startIndex, exs[51], [], [], tokenFunc, "constant.character.escape.js", optOnMatch))) {
        } else {
            return false;
        }
        return matchResult;
    } })};
    var parseLine = function(line, stateString, tokenFunc) {
        var frameStack = stateString.split('/');
        var scopeStack = [];
        for (var i = 0; i < frameStack.length; i++) {
            var scps = frames[frameStack[i]].scopes;
            scopeStack.push(scps && " " + scps);
        }
        var idx = 0;
        var lineLen = line.length;
        var tokenizedIdx = 0;
        var tokenizeUnmatched = function() {
            if (idx > tokenizedIdx) {
                tokenFunc(line.substring(tokenizedIdx, idx), scopeStack.join('').substring(1));
                tokenizedIdx = idx;
            }
        }
        while (idx < lineLen) {
            var frameResult = frames[frameStack[frameStack.length - 1]].go(
                    line, idx, tokenFunc, frameStack, scopeStack, tokenizeUnmatched);
            if (frameResult) {
                idx += frameResult[0];
                tokenizedIdx += frameResult[0];
            }
            else {
                idx++;
            }
        }
        tokenizeUnmatched();
        return frameStack.join('/');
    };
    var getClassesForScope = (function(scope) {
        return (((/(?:^| )comment(?=\.| |$)|(?:^| )extract\.custom\.title\.sql(?=\.| |$)/.test(scope) && " t1") || "") + ((/(?:^| )custom\.title\.sql(?=\.| |$)/.test(scope) && " t2") || "") + ((/(?:^| )keyword(?=\.| |$)|(?:^| )storage(?=\.| |$)/.test(scope) && " t3") || "") + ((/(?:^| )constant\.numeric(?=\.| |$)/.test(scope) && " t4") || "") + ((/(?:^| )constant(?=\.| |$)/.test(scope) && " t5") || "") + ((/(?:^| )constant\.language(?=\.| |$)/.test(scope) && " t6") || "") + ((/(?:^| )variable\.language(?=\.| |$)|(?:^| )variable\.other(?=\.| |$)/.test(scope) && " t7") || "") + ((/(?:^| )string(?=\.| |$)/.test(scope) && " t8") || "") + ((/(?:^| )constant\.character\.escape(?=\.| |$)|(?:^| )string(?=\.| |$).*?(?:^| )source(?=\.| |$)/.test(scope) && " t9") || "") + ((/(?:^| )meta\.preprocessor(?=\.| |$)/.test(scope) && " t10") || "") + ((/(?:^| )keyword\.control\.import(?=\.| |$)/.test(scope) && " t11") || "") + ((/(?:^| )entity\.name\.function(?=\.| |$)|(?:^| )support\.function\.any(?=\.| |$)/.test(scope) && " t12") || "") + ((/(?:^| )entity\.name\.type(?=\.| |$)/.test(scope) && " t13") || "") + ((/(?:^| )entity\.other\.inherited(?=\.| |$)/.test(scope) && " t14") || "") + ((/(?:^| )variable\.parameter(?=\.| |$)/.test(scope) && " t15") || "") + ((/(?:^| )storage\.type\.method(?=\.| |$)/.test(scope) && " t16") || "") + ((/(?:^| )meta\.section(?=\.| |$).*?(?:^| )entity\.name\.section(?=\.| |$)|(?:^| )declaration\.section(?=\.| |$).*?(?:^| )entity\.name\.section(?=\.| |$)/.test(scope) && " t17") || "") + ((/(?:^| )support\.function(?=\.| |$)/.test(scope) && " t18") || "") + ((/(?:^| )support\.class(?=\.| |$)|(?:^| )support\.type(?=\.| |$)/.test(scope) && " t19") || "") + ((/(?:^| )support\.constant(?=\.| |$)/.test(scope) && " t20") || "") + ((/(?:^| )support\.variable(?=\.| |$)/.test(scope) && " t21") || "") + ((/(?:^| )keyword\.operator\.js(?=\.| |$)/.test(scope) && " t22") || "") + ((/(?:^| )invalid(?=\.| |$)/.test(scope) && " t23") || "") + ((/(?:^| )invalid\.deprecated\.trailing(?=\.| |$)/.test(scope) && " t24") || "") + ((/(?:^| )text(?=\.| |$).*?(?:^| )source(?=\.| |$)|(?:^| )string\.unquoted(?=\.| |$)/.test(scope) && " t25") || "") + ((/(?:^| )text(?=\.| |$).*?(?:^| )source(?=\.| |$).*?(?:^| )string\.unquoted(?=\.| |$)|(?:^| )text(?=\.| |$).*?(?:^| )source(?=\.| |$).*?(?:^| )text(?=\.| |$).*?(?:^| )source(?=\.| |$)/.test(scope) && " t26") || "") + ((/(?:^| )meta\.tag\.preprocessor\.xml(?=\.| |$)/.test(scope) && " t27") || "") + ((/(?:^| )meta\.tag\.sgml\.doctype(?=\.| |$)|(?:^| )meta\.tag\.sgml\.doctype(?=\.| |$).*?(?:^| )entity(?=\.| |$)|(?:^| )meta\.tag\.sgml\.doctype(?=\.| |$).*?(?:^| )string(?=\.| |$)|(?:^| )meta\.tag\.preprocessor\.xml(?=\.| |$)|(?:^| )meta\.tag\.preprocessor\.xml(?=\.| |$).*?(?:^| )entity(?=\.| |$)|(?:^| )meta\.tag\.preprocessor\.xml(?=\.| |$).*?(?:^| )string(?=\.| |$)/.test(scope) && " t28") || "") + ((/(?:^| )string\.quoted\.docinfo\.doctype\.DTD(?=\.| |$)/.test(scope) && " t29") || "") + ((/(?:^| )meta\.tag(?=\.| |$)|(?:^| )declaration\.tag(?=\.| |$)/.test(scope) && " t30") || "") + ((/(?:^| )entity\.name\.tag(?=\.| |$)/.test(scope) && " t31") || "") + ((/(?:^| )entity\.other\.attribute(?=\.| |$)/.test(scope) && " t32") || "") + ((/(?:^| )markup\.heading(?=\.| |$)/.test(scope) && " t33") || "") + ((/(?:^| )markup\.quote(?=\.| |$)/.test(scope) && " t34") || "") + ((/(?:^| )markup\.list(?=\.| |$)/.test(scope) && " t35") || "")).substring(1);
    });
    return {parseLine:parseLine, initialState:"1",
        getClassesForScope:getClassesForScope};
}())
