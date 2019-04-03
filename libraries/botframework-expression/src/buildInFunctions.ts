import { EvaluationDelegate } from './methodBinder'
import { isNumber } from 'util'
const moment = require('moment');
/**
 * Implementations of <see cref="BuildinFunctions"/>.
 */
export abstract class BuildinFunctions {
    public static Add = (operands: any[]): EvaluationDelegate =>
        typeof operands[0] === 'number' && typeof operands[1] === 'number' ? <any>(operands[0] + operands[1]) :
        typeof operands[0] === 'string' && typeof operands[1] === 'string' ? <any>(operands[0] + operands[1]) :
        new Error()
    
    public static Sub = (operands: any[]): EvaluationDelegate =>
        typeof operands[0] === 'number' && typeof operands[1] === 'number' ? <any>(operands[0] - operands[1]) :
        new Error()

    public static Mul = (operands: any[]): EvaluationDelegate =>
        typeof operands[0] === 'number' && typeof operands[1] === 'number' ? <any>(operands[0] * operands[1]) :
        new Error()

    public static Div = (operands: any[]): EvaluationDelegate =>
        typeof operands[0] === 'number' && typeof operands[1] === 'number' ? <any>(Math.floor(operands[0] / operands[1])) :
        new Error()

    public static Min = (operands: any[]): EvaluationDelegate =>
        typeof operands[0] === 'number' && typeof operands[1] === 'number' ? <any>(operands[0] <= operands[1] ? operands[0] : operands[1]) :
        new Error()

    public static Max = (operands: any[]): EvaluationDelegate =>
        typeof operands[0] === 'number' && typeof operands[1] === 'number' ? <any>(operands[0] >= operands[1] ? operands[0] : operands[1]) :
        new Error()

    public static Pow = (operands: any[]): EvaluationDelegate =>
        typeof operands[0] === 'number' && typeof operands[1] === 'number' ? <any>(Math.pow(operands[0],operands[1])) :
        new Error()

    /* String functions */

    public static StrLength = (operands: any[]): EvaluationDelegate =>
        typeof operands[0] === 'string' && operands.length === 1 ? <any>(operands[0].length) :
        new Error()

    public static Replace = (operands: any[]): EvaluationDelegate =>
        operands.every(el => typeof(el)==='string') && operands.length === 3 ? <any>(operands[0].replace(RegExp(operands[1],'g'),operands[2])) :
        new Error()

    public static ReplaceIgnoreCase = (operands: any[]): EvaluationDelegate =>
        operands.every(el => typeof(el)==='string') && operands.length === 3 ? <any>(operands[0].replace(RegExp(operands[1],'gi'),operands[2])) :
        new Error()

    public static Concat = (operands: any[]): EvaluationDelegate =>
        operands.length > 1 && operands.every(el => typeof(el)==='string') ? <any>(''.concat(...operands)) :
        new Error()
    
    public static Split = (operands: any[]): EvaluationDelegate =>
        operands.every(el => typeof(el)==='string') && operands.length === 2 ? <any>(operands[0].split(operands[1])) :
        new Error()

    public static Substring = (operands: any[]): EvaluationDelegate =>
        typeof operands[0] ==='string'&& typeof operands[1] ==='number'&& typeof operands[2] ==='number'&& operands.length === 3 && operands[1] >=0 
        ? <any>(operands[0].substring(operands[1],operands[2])) :
        new Error()


    public static ToLower = (operands: any[]): EvaluationDelegate =>
        operands.every(el => typeof(el)==='string') && operands.length === 1 ? <any>(operands[0].toLowerCase()) :
        new Error()


    public static ToUpper = (operands: any[]): EvaluationDelegate =>
        operands.every(el => typeof(el)==='string') && operands.length === 1 ? <any>(operands[0].toUpperCase()) :
        new Error()

    public static Trim = (operands: any[]): EvaluationDelegate =>
        operands.every(el => typeof(el)==='string') && operands.length === 1 ? <any>(operands[0].trim()) :
        new Error()

    /* Collection Functions */
    public static Contains = (operands: any[]): EvaluationDelegate =>{
        if(operands.length===2 && typeof(operands[1]) === 'string'){
            if(typeof(operands[0])==='string' || Array.isArray(operands[0]))
                return <any>operands[0].includes(operands[1])
            else if(typeof(operands[0]==='object'))
                return <any>(operands[1] in operands[0])
            else
                new Error()
        }
        else
            new Error()
    }

    public static Empty = (operands: any[]): EvaluationDelegate =>{
        if(operands.length===1){
            if(operands[0] instanceof Array|| typeof operands[0] === 'string')
                return <any>(operands[0].length === 0? true :false )
            else if(typeof(operands[0]==='object'))
                return <any>(Object.keys(operands[0]).length === 0 ?true:false)
            else
                new Error()    
        }
        else
            new Error()
    }

    public static First = (operands: any[]): EvaluationDelegate =>{
        if(operands.length===1){
            if(operands[0] instanceof Array|| typeof operands[0] === 'string')
                return <any>(operands[0][0])
            else if(typeof(operands[0]==='object'))
                return <any>(operands[0][Object.keys(operands[0])[0]])
            else
                new Error()    
        }
        else
            new Error()
    }

    public static Last = (operands: any[]): EvaluationDelegate =>{
        if(operands.length===1){
            if(operands[0] instanceof Array || typeof operands[0] === 'string')
                return <any>(operands[0][operands[0].length-1])
            else if(typeof(operands[0]==='object'))
                return <any>(operands[0][Object.keys(operands[0])[Object.keys(operands[0]).length-1]])
            else
                new Error()    
        }
        else
            new Error()
    }

    public static Count = (operands: any[]): EvaluationDelegate =>{
        if(operands.length===1){
            if(operands[0] instanceof Array|| typeof operands[0] === 'string')
                return <any>(operands[0].length)
            else if(typeof(operands[0]==='object'))
                return <any>(Object.keys(operands[0]).length)
            else
                new Error()    
        }
        else
            new Error()
    }

    public static Join = (operands: any[]): EvaluationDelegate =>{
        if(operands.length===2 && operands[0] instanceof Array && typeof operands[1] === 'string')
            return <any>(operands[0].join(operands[1]))
        else
            new Error()
    }
    
    /* Logical comparison functions */

    public static Equal = (operands: any[]): EvaluationDelegate =>
        typeof operands[0] === 'number' && typeof operands[1] === 'number' ? <any>(operands[0] === operands[1]) :
        typeof operands[0] === 'string' && typeof operands[1] === 'string' ? <any>(operands[0] === operands[1]) :
        typeof operands[0] === 'boolean' && typeof operands[1] === 'boolean' ? <any>(operands[0] === operands[1]) :
        new Error()

    public static NotEqual = (operands: any[]): EvaluationDelegate =>
        typeof operands[0] === 'number' && typeof operands[1] === 'number' ? <any>(operands[0] !== operands[1]) :
        typeof operands[0] === 'string' && typeof operands[1] === 'string' ? <any>(operands[0] !== operands[1]) :
        typeof operands[0] === 'boolean' && typeof operands[1] === 'boolean' ? <any>(operands[0] !== operands[1]) :
        new Error()

    public static LessThan = (operands: any[]): EvaluationDelegate =>
        typeof operands[0] === 'number' && typeof operands[1] === 'number' ? <any>(operands[0] < operands[1]) :
        new Error()

    public static LessThanOrEqual = (operands: any[]): EvaluationDelegate =>
        typeof operands[0] === 'number' && typeof operands[1] === 'number' ? <any>(operands[0] <= operands[1]) :
        new Error()

    public static GreaterThan = (operands: any[]): EvaluationDelegate =>
        typeof operands[0] === 'number' && typeof operands[1] === 'number' ? <any>(operands[0] > operands[1]) :
        new Error()

    public static GreaterThanOrEqual = (operands: any[]): EvaluationDelegate =>
        typeof operands[0] === 'number' && typeof operands[1] === 'number' ? <any>(operands[0] >= operands[1]) :
        new Error()
        
    public static And = (operands: any[]): EvaluationDelegate =>
        typeof operands[0] === 'boolean' && typeof operands[1] === 'boolean' ? <any>(operands[0] && operands[1]) :
        new Error()

    public static Not = (operands: any[]): EvaluationDelegate =>
        typeof operands[0] === 'boolean' ? !<boolean>operands[0] :
        typeof operands[0] === 'number' ? operands[0] === 0 :
        <any>(operands[0] === undefined || operands[0] === null || operands[0] === '')

    public static Or = (operands: any[]): EvaluationDelegate =>
        typeof operands[0] === 'boolean' && typeof operands[1] === 'boolean' ? <any>(operands[0] || operands[1]) :
        new Error()

    public static Exist = (operands: any[]): EvaluationDelegate =>
        operands.length === 1 ? <any>(operands[0] != undefined ? <any>(true) : <any>(false)) :
        new Error()
        
    public static If = (operands: any[]): EvaluationDelegate =>
        operands.length === 3  && operands.every(el=>el != undefined) ? ( eval(operands[0]) ? operands[1] : operands[2]) :
        new Error()

    /* Conversion functions */

    public static Int = (operands: any[]): EvaluationDelegate =>{
        if(operands.length === 1  && typeof operands[0] === 'string' || typeof operands[0] === 'number')
        {
            if (!Number.isNaN(Number(operands[0])) && Number.isInteger(Number(operands[0])))
                return <any>(Number(operands[0]))
            else
                return <any>(operands[0])           
        }else
            new Error()
    }
    
    public static Float = (operands: any[]): EvaluationDelegate =>{
        if(operands.length === 1  && typeof operands[0] === 'string' || typeof operands[0] === 'number')
        {
            if (!Number.isNaN(Number(operands[0])) && !Number.isInteger(Number(operands[0])))
                return <any>(Number(operands[0]))
            else
                return <any>(operands[0])           
        }else
            new Error()
    }
        
    public static String = (operands: any[]): EvaluationDelegate =>{
        if(operands.length === 1  && typeof operands[0] != 'object')
            return <any>(String(operands[0]))
        else if(typeof operands[0]==='object')
            return <any> (JSON.stringify(operands[0]).replace(/"/gi,'\\\"'))    
        else
            new Error()
    }

    public static Bool = (operands: any[]): EvaluationDelegate =>{
        if(operands.length === 1  && typeof operands[0] === 'number')
            return <any>(Boolean(operands[0]))
        else if(typeof operands[0]==='string'){
            if(operands[0].toLowerCase()==='true')
                return <any>(true)
            else if(operands[0].toLowerCase()==='false')
                return <any>(false)
            else
                new Error()
        }
                
        else
            new Error()
    }
    
    public static CreateArray = (operands: any[]): EvaluationDelegate =>{
        return <any>(Array(...operands))
    }




    /* Math functions */
    public static Mod = (operands: any[]): EvaluationDelegate =>
        typeof operands[0] === 'number' && typeof operands[1] === 'number' && operands.length === 2 ? <any>(operands[0] % operands[1]) :
        new Error()

    public static Rand = (operands: any[]): EvaluationDelegate =>
        typeof operands[0] === 'number' && typeof operands[1] === 'number' && operands[0]<=operands[1]? <any>(Math.floor(Math.random()*(operands[1]-operands[0])+ operands[0])) :
        new Error()
        
    public static ArraySum = (operands: any[]): EvaluationDelegate =>
        operands.length == 1 && operands[0].every(el=>isNumber(el)) && operands[0] instanceof Array ? <any>(operands[0].reduce((x,y)=>x+y)) :
        new Error()

    public static ArrayAverage = (operands: any[]): EvaluationDelegate =>
        operands.length == 1 && operands[0].every(el=>isNumber(el)) && typeof operands[0] === 'object' ? <any>((operands[0].reduce((x,y)=>x+y))/operands[0].length) :
        new Error()
    
    
    /* Date and time functions  */

    public static AddDays = (operands: any[]): EvaluationDelegate =>{
        if(operands.length==2)
            return <any>(moment.parseZone(operands[0]).add(operands[1],'d').format())
        else if (operands.length === 3)
            return <any>(moment.parseZone(operands[0]).add(operands[1],'d').format(operands[2]))     
        else
            new Error()
    }
    
    public static AddHours = (operands: any[]): EvaluationDelegate =>{
        if(operands.length==2)
            return <any>(moment.parseZone(operands[0]).add(operands[1],'h').format())
        else if (operands.length === 3)
            return <any>(moment.parseZone(operands[0]).add(operands[1],'h').format(operands[2]))     
        else
            new Error()
    }
    
    
    public static AddMinutes = (operands: any[]): EvaluationDelegate =>{
        if(operands.length==2)
            return <any>(moment.parseZone(operands[0]).add(operands[1],'minutes').format())
        else if (operands.length === 3)
            return <any>(moment.parseZone(operands[0]).add(operands[1],'minutes').format(operands[2]))     
        else
            new Error()
    }
    
    
    public static AddSeconds = (operands: any[]): EvaluationDelegate =>{
        if(operands.length==2)
            return <any>(moment.parseZone(operands[0]).add(operands[1],'seconds').format())
        else if (operands.length === 3)
            return <any>(moment.parseZone(operands[0]).add(operands[1],'seconds').format(operands[2]))     
        else
            new Error()
    }
    

    public static DayOfWeek = (operands: any[]): EvaluationDelegate =>{
        if(operands.length==1)
            return <any>(moment(operands[0]).days())  
        else
            new Error()
    }
    
    public static DayOfMonth = (operands: any[]): EvaluationDelegate =>{
        if(operands.length==1)
            return <any>(moment(operands[0]).date())
        else
            new Error()
    }

    public static DayOfYear = (operands: any[]): EvaluationDelegate =>{
        if(operands.length==1)
            return <any>(moment(operands[0]).dayOfYear())   
        else
            new Error()
    }

    public static FormatDateTime = (operands: any[]): EvaluationDelegate =>{
        if(operands.length==2)
            return <any>(moment(operands[0]).format(operands[1]))
        else if (operands.length == 1 && typeof operands[0] ==='string' )
            return <any>(moment.parseZone(operands[0]).format())
        else
            new Error()
    }

    public static SubtractFromTime = (operands: any[]): EvaluationDelegate =>{
        if(operands.length==3 && typeof operands[0] === 'string' &&typeof operands[1] === 'number' &&typeof operands[2] === 'string' ){
            if (["second", "minute", "hour", "day", "week", "month", "year"].indexOf(operands[2].toLowerCase())!= -1)  
                if(!operands[3])
                    return <any>(moment.parseZone(operands[0]).subtract(operands[1],operands[2]).format())
                else if (typeof operands[3]==='string')
                    return <any>(moment.parseZone(operands[0]).subtract(operands[1],operands[2]).format(operands))
                else
                    new Error()
        }
        else
            new Error()
    }

    /* TODO: Fix problem of empty operands cant be parsed */
    public static UtcNow = (operands: any[]): EvaluationDelegate =>{
        if(operands.length==0)
            return <any>(moment().utc().format())
        else if (operands.length === 1)
            return <any>(moment().utc().format(operands[0]))
        else
            new Error()
    }

    public static Date = (operands: any[]): EvaluationDelegate =>{
        if(operands.length==1)
            return <any>(moment.parseZone(operands[0]).format('M/DD/YYYY'))
        else if (operands.length === 2)
            return <any>(moment.parseZone(operands[0]).format(operands[1]))
        else
            new Error()
    }
    public static Month = (operands: any[]): EvaluationDelegate =>{
        if(operands.length==1)
            return <any>(moment.parseZone(operands[0]).month()+1)
        else
            new Error()
    }
    public static Year = (operands: any[]): EvaluationDelegate =>{
        if(operands.length==1)
            return <any>(moment.parseZone(operands[0]).year())
        else
            new Error()
    }

    public static GetTimeOfDay = (operands: any[]): EvaluationDelegate =>{
        if(operands.length==1 && typeof operands[0] === 'string'){
            const thisTime = moment.parseZone(operands[0]).hour()*100+moment.parseZone(operands[0]).minute()
            if (thisTime === 0)
                return <any>('midnight')
            else if (thisTime >0 && thisTime < 1200)
                return <any>('morning')
            else if (thisTime === 1200)
                return <any>('noon')
            else if (thisTime >1200 && thisTime < 1800)
                return <any>('afternoon')
            else if (thisTime >=1800 && thisTime <= 2200)
                return <any>('evening')
            else if (thisTime >2200 && thisTime <= 2359)
                return <any>('night')
        }
        else
            new Error()
    }

    public static DateReadBack = (operands: any[]): EvaluationDelegate =>{
        if(operands.length==2 && operands.every(el => typeof el === 'string')){
            if(moment.parseZone(operands[0]).format('YYYY-MM-DD') === moment.parseZone(operands[1]).format('YYYY-MM-DD'))
                return <any>('Today')
            else if(moment.parseZone(operands[0]).format('YYYY-MM-DD') === moment.parseZone(operands[1]).subtract(1,'day').format('YYYY-MM-DD'))
                return <any>('Tomorrow')
            else if(moment.parseZone(operands[1]).format('YYYY-MM-DD') === moment.parseZone(operands[0]).subtract(1,'day').format('YYYY-MM-DD'))
                return <any>('Yesterday')
            else 
                new Error()
        }
        else
            new Error()
    }
    


    /* Object manipulation and construction functions  */

    public static Json = (operands: any[]): EvaluationDelegate =>
        typeof operands[0] === 'string' ? <any>(JSON.parse(operands[0])) :
        new Error()

    public static AddProperty = (operands: any[]): EvaluationDelegate =>{
        if(typeof operands[0] === 'object' && typeof operands[1] === 'string' && typeof operands[2] === 'string'){
            operands[0][operands[1]]=operands[2]
            return operands[0]
        }else{
            new Error()
        }
    }

    public static RemoveProperty = (operands: any[]): EvaluationDelegate =>{
        if(typeof operands[0] === 'object' && typeof operands[1] === 'string'){
            delete operands[0][operands[1]]
            return operands[0]
        }else{
            new Error()
        }
    }

    public static SetProperty = (operands: any[]): EvaluationDelegate =>{
        if(typeof operands[0] === 'object' && typeof operands[1] === 'string' && typeof operands[2] === 'string'){
            operands[0][operands[1]]=operands[2]
            return operands[0]
        }else{
            new Error()
        }
    }
}