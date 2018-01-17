// 
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
// 
// Microsoft Bot Framework: http://botframework.com
// 
// Bot Builder SDK Github:
// https://github.com/Microsoft/BotBuilder
// 
// Copyright (c) Microsoft Corporation
// All rights reserved.
// 
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
// 
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

export const locales: { [locale:string]: { [key:string]: string; }; } = {};

locales['de'] = {
    "default_text": "Das habe ich nicht verstanden. Bitte versuch es nochmal",
    "default_number": "Die Zahl habe ich nicht verstanden. Bitte geben Sie eine Nummer an.",
    "default_confirm": "Das habe ich nicht verstanden. Bitte wählen Sie Ja oder Nein",
    "default_choice": "Das habe ich nicht verstanden. Bitte wählen Sie eine Option aus der Liste",
    "default_time": "Die eingegebene Zeit habe ich nicht verstanden. Bitte geben Sie es im folgenden Format ein (MM/TT/JJJJ HH:MM:SS).",
    "default_file": "Ich habe nichts empfangen. Bitte versuchen Sie es erneut.",
    "default_error": "Ups. Etwas falsch und wir müssen wieder anfangen",
    "list_or": " oder ",
    "list_or_more": ", oder ",
    "confirm_yes": "ja",
    "confirm_no": "nein",
    "boolean_choices": "true=y,yes,ja,richtig,\uD83D\uDC4D,\uD83D\uDC4C|false=n,no,nein,falsch,\uD83D\uDC4E,\u270B,\uD83D\uDD90",
    "number_exp": "[+-]?(?:\\d+\\.?\\d*|\\d*\\.?\\d+)",
    "number_terms": "0=null|1=eins|2=zwei|3=drei|4=vier|5=fünf|6=sechs|7=sieben|8=acht|9=neun|10=zehn|11=elf|12=zwölf|13=dreizehn|14=vierzehn|15=fünfzehn|16=sechzehn|17=siebzehn|18=achtzehn|19=neunzehn|20=zwanzig",
    "number_ordinals": "1=1st,erste|2=2nd,zweite|3=3rd,dritte|4=4th,vierte|5=5th,fünfte|6=6th,sechste|7=7th,siebte|8=8th,achte|9=9th,neunte|10=10th,zehnte",
    "number_reverse_ordinals": "-1=letzte,zuletzt|-2=vorletzte,daneben, zweite von letzter|-3=dritter von letzter,drittel bis zum letzten|-4=vierte von letzter,vierte bis zuletzt|-5=fünfte vom letzten,fünfte bis zuletzt",
    "number_minValue_error": "Die eingegebene Zahl war kleiner als der minimal zulässigen Zahlenwert von %(minValue)d. Bitte wählen Sie eine gültige Nummer",
    "number_maxValue_error": "Die eingegebene Zahl war größer als der maximal zulässige Zahlenwert von %(maxValue)d. Bitte wählen Sie eine gültige Nummer.",
    "number_range_error": "Die eingegebene Nummer lag außerhalb des zulässigen Bereichs von %(minValue)d bis %(maxValue)d. Bitte wählen Sie eine gültige Nummer.",
    "number_integer_error": "Ihre Wahl ist keine Ganzzahl. Bitte wählen Sie eine Zahl ohne Dezimalzahl",
    "yesExp": "^(1|ja|richtig|wahr)(\\W|$)",
    "noExp": "^(2|nein|falsch)(\\W|$)"
};

locales['en'] = {
    "default_text": "I didn't understand. Please try again.",
    "default_number": "I didn't recognize that as a number. Please enter a number.",
    "default_confirm": "I didn't understand. Please answer 'yes' or 'no'.",
    "default_choice": "I didn't understand. Please choose an option from the list.",
    "default_time": "I didn't recognize the time you entered. Please try again using a format of (MM/DD/YYYY HH:MM:SS).",
    "default_file": "I didn't receive a file. Please try again.",
    "default_error": "Oops. Something went wrong and we need to start over.",
    "list_or": " or ",
    "list_or_more": ", or ",
    "confirm_yes": "yes",
    "confirm_no": "no",
    "boolean_choices": "true=y,yes,yep,sure,ok,\uD83D\uDC4D,\uD83D\uDC4C|false=n,no,nope,\uD83D\uDC4E,\u270B,\uD83D\uDD90",
    "number_exp": "[+-]?(?:\\d+\\.?\\d*|\\d*\\.?\\d+)",
    "number_terms": "0=zero|1=one|2=two|3=three|4=four|5=five|6=six|7=seven|8=eight|9=nine|10=ten|11=eleven|12=twelve|13=thirteen|14=fourteen|15=fifteen|16=sixteen|17=seventeen|18=eighteen|19=nineteen|20=twenty",
    "number_ordinals": "1=1st,first|2=2nd,second|3=3rd,third|4=4th,fourth|5=5th,fifth|6=6th,sixth|7=7th,seventh|8=8th,eighth|9=9th,ninth|10=10th,tenth",
    "number_reverse_ordinals": "-1=last|-2=next to last,second to last,second from last|-3=third to last,third from last|-4=fourth to last,fourth from last|-5=fifth to last,fifth from last",
    "number_minValue_error": "The number you entered was below the minimum allowed value of %(minValue)d. Please enter a valid number.",
    "number_maxValue_error": "The number you entered was above the maximum allowed value of %(maxValue)d. Please enter a valid number.",
    "number_range_error": "The number you entered was outside the allowed range of %(minValue)d to %(maxValue)d. Please enter a valid number.",
    "number_integer_error": "The number you entered was not an integer. Please enter a number without a decimal mark.",
    "text_minLength_error": "The text you entered was below the minimum allowed length of %(minLength)d. Please enter a valid text.",
    "text_maxLength_error": "The text you entered was above the maximum allowed length of %(maxLength)d. Please enter a valid text.",
    "yesExp": "^(1|y|yes|yep|sure|ok|true)(\\W|$)",
    "noExp": "^(2|n|no|nope|not|false)(\\W|$)"
};

locales['es'] = {
    "default_text": "No se pudo reconocer su respuesta. Por favor vuelva a intentar.",
    "default_number": "No se pudo reconocer el texto como número. Vuelva a intentar sólo con números.",
    "default_confirm": "No se pudo reconocer la confirmación. Por favor responda con 'sí' o 'no'.",
    "default_choice": "No se pudo reconocer su respuesta. Por favor seleccione una opción de la lista.",
    "default_time": "No se pudo reconocer el formato de la fecha. Por favor vuelva a intentar (MM/DD/YYYY HH:MM:SS).",
    "default_file": "No se pudo recibir el archivo. Por favor vuelva a intentar.",
    "default_error": "Oops. Ocurrió un problema. Por favor vuelva a intentar.",
    "list_or": " o ",
    "list_or_more": ", o ",
    "confirm_yes": "sí",
    "confirm_no": "no",    
    "boolean_choices": "true=y,yes,s,sí,si,vale,ok,\uD83D\uDC4D,\uD83D\uDC4C|false=n,no,falso,\uD83D\uDC4E,\u270B,\uD83D\uDD90",
    "yesExp": "^(1|s|sí|si|vale|ok)(\\W|$)",
    "noExp": "^(2|n|no|falso)(\\W|$)"
};

locales['fr'] = {
    "default_text": "Je n'ai pas compris. Veuillez réessayer.",
    "default_number": "Ce n'est pas un nombre. Merci d'entrer un nombre.",
    "default_confirm": "Je n'ai pas compris. Merci de répondre 'oui' ou 'non'.",
    "default_choice": "Je n'ai pas compris. Merci de choisir une option de la liste.",
    "default_time": "Je n'ai pas reconnu la date. Veuillez réessayer en utilisant le format (MM/JJ/AAAA HH:MM:SS).",
    "default_file": "Je n'ai reçu aucun fichier. Veuillez réessayer.",
    "default_error": "Oups. Il y a eu un problème et je crains que nous devions recommencer.",
    "list_or": " ou ",
    "list_or_more": ", ou ",
    "confirm_yes": "oui",
    "confirm_no": "non",
    "boolean_choices": "true=y,yes,oui,\uD83D\uDC4D,\uD83D\uDC4C|false=n,no,non,\uD83D\uDC4E,\u270B,\uD83D\uDD90",
    "number_terms": "0=zéro,zero|1=un,une|2=deux|3=trois|4=quatre|5=cinq|6=six|7=sept|8=huit|9=neuf|10=dix|11=onze|12=douze|13=treize|14=quatorze|15=quinze|16=seize|17=dix-sept|18=dix-huit|19=dix-neuf|20=vingt",
    "number_ordinals": "1=1er,1re,premier,premiere,première|2=2e,2ème,2eme,deuxieme,deuxième,second,seconde|3=3e,3ème,3eme,troisieme,troisième|4=4e,4ème,4eme,quatrieme,quatrième|5=5e,5ème,5eme,cinquieme,cinquième|6=6e,6ème,6eme,sixieme,sixième|7=7e,7ème,7eme,septieme,septième|8=8e,8ème,8eme,huitieme,huitième|9=9e,9ème,9eme,neuvieme,neuvième|10=10e,10ème,10eme,dixieme,dixième",
    "number_reverse_ordinals": "-1=dernier,derniere,dernière|-2=avant-dernier,avant-derniere,avant-dernière",
    "yesExp": "^(1|oui)(\\W|$)",
    "noExp": "^(2|non)(\\W|$)"
};

locales['it'] = {
    "default_text": "Non ho capito. Riprova per favore.",
    "default_number": "Il valore inserito non sembra essere un numero. Per favore inserisci un numero.",
    "default_confirm": "Non ho capito. Per favore rispondi 'sì' o 'no'.",
    "default_choice": "Non ho capito. Per favore scegli un'opzione dalla lista.",
    "default_time": "Il valore inserito non sembra essere una data. Attualmente capisco solo date in inglese. Per favore riprova specificando la data in inglese (p.es. 17 August 2013, 08/17/2013 [nota: il mese viene prima in questo formato!], 5 days ago, Today, ecc.).",
    "default_file": "Non ho ricevuto nessun file. Riprova per favore.",
    "default_error": "Ops. Qualcosa è andato storto e dobbiamo ricominciare da capo.",
    "list_or": " o ",
    "list_or_more": " o ",
    "confirm_yes": "sì",
    "confirm_no": "no",
    "boolean_choices": "true=y,yes,sì,\uD83D\uDC4D,\uD83D\uDC4C|false=n,no,\uD83D\uDC4E,\u270B,\uD83D\uDD90",
    "yesExp": "^(1|sì)(\\W|$)",
    "noExp": "^(2|no)(\\W|$)"
};

locales['nl'] = {
    "default_text": "Ik heb het niet begrepen. Kun je het opnieuw proberen? ",
    "default_number": "Ik kan dit getal niet herkennen. Kun je opnieuw een getal invoeren?",
    "default_confirm": "Ik heb je niet begrepen. Kun je 'ja' of 'nee' antwoorden?",
    "default_choice": "Ik heb het niet begrepen. Kies een optie uit de lijst.",
    "default_time": "Ik kan de tijd die je hebt ingevoerd niet herkennen. Kun je het opnieuw proberen in het formaat MM/DD/YYYY HH:MM:SS?",
    "default_file": "Ik heb geen bestand ontvangen. Kun je het opnieuw proberen?",
    "default_error": "Oeps. Er is iets foutgegaan en we moeten helaas opnieuw beginnen.",
    "list_or": " of ",
    "list_or_more": ", of ",
    "confirm_yes": "ja",
    "confirm_no": "nee",
    "boolean_choices": "true=y,yes,ja,\uD83D\uDC4D,\uD83D\uDC4C|false=n,no,nee,\uD83D\uDC4E,\u270B,\uD83D\uDD90",
    "yesExp": "^(1|y|yes|ja)(\\W|$)",
    "noExp": "^(2|n|no|nee)(\\W|$)"
};

locales['pt'] = {
    "default_text": "Não consigo entender. Por favor, tente novamente.",
    "default_number": "Não consigo entender isso como um número. Por favor, escreva somente números.",
    "default_confirm": "Não entendi. Por favor, responda 'sim' ou 'não'",
    "default_choice": "Não consigo entender. Por favor, selecione uma opção da lista.",
    "default_time": "Não consigo entender o formato que você usou. Por favor, tente novamente usando o formato (MM/DD/AAAA HH:MM:SS).",
    "default_file": "Não consegui receber o arquivo. Por favor, tente novamente.",
    "default_error": "Oops. Algo deu errado. Por favor, comece novamente.",
    "list_or": " ou ",
    "list_or_more": ", ou ",
    "confirm_yes": "sim",
    "confirm_no": "não",
    "boolean_choices": "true=y,yes,sim,\uD83D\uDC4D,\uD83D\uDC4C|false=n,no,não,\uD83D\uDC4E,\u270B,\uD83D\uDD90",
    "yesExp": "^(1|sim)(\\W|$)",
    "noExp": "^(2|não)(\\W|$)"
};

locales['ru'] = {
    "default_text": "Не понимаю. Пожалуйста, повторите.",
    "default_number": "Не похоже на число. Пожалуйста, введите число.",
    "default_confirm": "Не понимаю. Пожалуйста, ответьте 'да' или 'нет'.",
    "default_choice": "Не понимаю. Пожалуйста, выберите ответ из списка.",
    "default_time": "Не похоже на время. Пожалуйста, повторите в формате (MM/ДД/ГГГГ ЧЧ:MM:СС).",
    "default_file": "Файл не получен. Пожалуйста, повторите.",
    "default_error": "Непредвиденная ошибка. Мы вынуждены начать сначала.",
    "list_or": " или ",
    "list_or_more": ", или ",
    "confirm_yes": "да",
    "confirm_no": "нет",
    "boolean_choices": "true=y,yes,да,\uD83D\uDC4D,\uD83D\uDC4C|false=n,no,нет,\uD83D\uDC4E,\u270B,\uD83D\uDD90",
    "yesExp": "^(1|y|yes|да)(\\W|$)",
    "noExp": "^(2|n|no|нет)(\\W|$)"
};

locales['tr'] = {
    "default_text": "Sizi anlayamadım. Lütfen tekrar deneyiniz.",
    "default_number": "Bu bir sayı değil. Lütfen bir sayı giriniz.",
    "default_confirm": "Sizi anlayamadım. Lütfen 'evet' veya 'hayır' olarak cevaplayınız.",
    "default_choice": "Sizi anlayamadım. Lütfen listeden bir seçim yapınız.",
    "default_time": "Girmiş olduğunuz tarih formatını tanıyamadım. Lütfen tekrar (DD/MM/YYYY HH:MM:SS) formatını kullanarak deneyiniz.",
    "default_file": "Herhangi bir dosya alamadım. Lütfen tekrar deneyiniz.",
    "default_error": "Beklenmeyen bir hata oluştu. Yeniden başlamalıyız.",
    "list_or": " veya ",
    "list_or_more": ", veya ",
    "confirm_yes": "evet",
    "confirm_no": "hayır",
    "boolean_choices": "true=y,yes,evet,\uD83D\uDC4D,\uD83D\uDC4C|false=n,no,hayır,\uD83D\uDC4E,\u270B,\uD83D\uDD90",
    "yesExp": "^(1|y|yes|evet)(\\W|$)",
    "noExp": "^(2|n|no|hayır)(\\W|$)"
};

locales['zh-hans'] = {
    "default_text": "我没听明白。请重复。",
    "default_number": "这好像不是数字. 请输入数字",
    "default_confirm": "我没听明白。 请选择'是'或'否'。",
    "default_choice": "我没听明白。请从可选项中选择。",
    "default_time": "这好像不是日期，时间。 请输入日期，时间 (月月/日日/年年年年 时时:分分:秒秒)。",
    "default_file": "我没有收到文件，请再传一次。",
    "default_error": "啊呀。发生故障了，我需要重启。",
    "list_or": "或",
    "list_or_more": ", 或",
    "confirm_yes": "是",
    "confirm_no": "不",
    "boolean_choices": "true=y,yes,\u662f,\u786e\u8ba4,\u662f\u7684,\u597d\u7684,\u597d,\u6ca1\u95ee\u9898,\u5bf9,\u5bf9\u7684,\uD83D\uDC4D,\uD83D\uDC4C|false=n,no,\u4e0d,\u4e0d\u662f,\u4e0d\u5bf9,\u4e0d\u77e5\u9053,\u4e0d\u884c,\uD83D\uDC4E,\u270B,\uD83D\uDD90",
    "yesExp": "^(\u662f|\u786e\u8ba4|\u662f\u7684|\u597d\u7684|\u597d|\u6ca1\u95ee\u9898|\u5bf9|\u5bf9\u7684)(\\W|$)",
    "noExp": "^(\u4e0d|\u4e0d\u662f|\u4e0d\u5bf9|\u4e0d\u77e5\u9053|\u4e0d\u884c)(\\W|$)"
};


