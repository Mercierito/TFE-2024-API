const express=require('express')
const router= express.Router()
const Joi= require('joi')
const config=require('config')
const sequelize=require('../dbConnection')
const {Bill}=require('../models/bill')
const ExcelJS=require('exceljs')
const{Order}=require('../models/order')
const{User}=require('../models/user')
const{Course}=require('../models/course')
const{Menu}=require('../models/menu')
const{format}=require('date-fns')

router.get('/',async(req,res)=>{
    try{
        const bills=await Bill.findAll()
        res.status(200).send(bills)
    }catch(error){
        console.log('Error :', error)
        res.status(500).send('Internal Server Error')
    }
})



router.post('/file',(req,res)=>{
    generateExcel(res,req)
})


async function generateExcel(res,req){
    var workbook=new ExcelJS.Workbook()

    

    
    
    const date=new Date();
    const currentYear=date.getFullYear().toString().slice(-2)
    const formatedDate=format(date,'dd/MM/yyyy')

    console.log(formatedDate)
    console.log(currentYear)

    var order=await Order.findOne({
        where:{
            id:req.body.orderId
        }
    })
    var bill=await Bill.findOne({
        where:{
            orderId:order.id
        }
    })

    var billNumber='yy-xxx'

    if(!bill){

        var bills=await Bill.findAll()
        var lastBill=bills[bills.length-1]

        var split=lastBill.billNumber.split('-')
        if(currentYear!=split[0])
        {
            billNumber=`${currentYear}-001`
        }else{
            billNumber=`${currentYear}-${String(Number(split[1]) + 1).padStart(3, '0')}`
        }
        const newBill=await Bill.create({
            billNumber:billNumber,
            orderId:order.id
        })
    }
    else{
        billNumber=bill.billNumber
    }

    var user = await User.findOne({
        where:{
            id: order.userId
        }
    })

    var splitAddress=user.address.split(',')

    var worksheet=workbook.addWorksheet('Sheet 1')

    var data = [
        ['Name', 'Age', 'Country'],
        ['John Doe', 25, 'USA'],
        ['Jane Doe', 30, 'Canada'],
        ['Bob Smith', 22, 'UK']
    ]

    //worksheet.addRows(data)

    worksheet.getColumn('A').width=2

    worksheet.getCell('B1').value="Nicolas d' Haese"
    worksheet.mergeCells('B1:G1')
    worksheet.getCell('B1').font={
        name: 'Script MT Bold',
        size:24,
        
    }
    worksheet.getCell('B1').alignment={horizontal:'center',vertical:'bottom'}
   

    worksheet.getCell('B2').value='rue de la Loge, 38'
    worksheet.getCell('B2').font={
        name:'Calibri',
        size:14,
        bold:true,
        
    }

    worksheet.getCell('B3').value='7864 Bois de Lessines'
    worksheet.getCell('B3').font={
        name:'Calibri',
        size:14,
        bold:true,
        
    }

    worksheet.getCell('B4').value='GSM : 0475 687 555           Compte : BE52 0016 1926 0709'
    worksheet.getCell('B4').font={
        name:'Calibri',
        size :12,
        
    }

    worksheet.getCell('B5').value='TVA : BE 0828.429.389            Mail : contact@dhaese-nicolas.be'
    worksheet.getCell('B5').font={
        name:'Calibri',
        size :12,
        
    }

    worksheet.getRow('6').height=15

    worksheet.getCell('E7').value=user.name
    worksheet.getCell('E7').font={
        name:'Calibri',
        size:18,
        bold:true
    }
    worksheet.mergeCells('E7:H7')

    worksheet.getCell('E9').value=splitAddress[0]
    worksheet.getCell('E9').font={
        name:'Calibri',
        size:14,
        bold:true
    }
    worksheet.mergeCells('E9:H9')

    worksheet.getCell('E10').value=splitAddress[1]+'          '+splitAddress[2]
    worksheet.getCell('E10').font={
        name:'Calibri',
        size:18,
        bold:true
    }
    worksheet.mergeCells('E10:H10')

    worksheet.getCell('E13').value=`Bois de Lessines, ${formatedDate}`
    worksheet.getCell('E13').font={
        name:'Calibri',
        size:11
    }

    worksheet.getCell('E15').value=`Facture n°${billNumber}`
    worksheet.getCell('E15').font={
        name:'Calibri',
        size:11
    }

    worksheet.getCell('A17').value='Doit pour vente'
    worksheet.getCell('A17').font={
        name:'Calibri',
        size:11
    }

    worksheet.getRow('18').height=30
    worksheet.getColumn('H').width=11

    worksheet.getCell('B18').value='Désignation'
    worksheet.getCell('B18').font={
        name:'Calibri',
        size:11
    }

    worksheet.getCell('F18').value='Quantité'
    worksheet.getCell('F18').font={
        name:'Calibri',
        size:11
    }

    worksheet.getCell('G18').value='P.U. TVAC'
    worksheet.getCell('G18').font={
        name:'Calibri',
        size:11
    }

    worksheet.getCell('H18').value='Total TVAC'
    worksheet.getCell('H18').font={
        name:'Calibri',
        size:11
    }

    worksheet.getCell('I18').value='Code TVA'
    worksheet.getCell('I18').font={
        name:'Calibri',
        size:11
    }


    

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${billNumber} facture.xlsx`);


    workbook.xlsx.write(res).then(workbook.xlsx.writeFile(`${billNumber} facture.xlsx`))
        .then(function() {
            console.log('Excel file sent successfully');
            res.end();
        })
        .catch(function(error) {
            console.error('Error sending Excel file:', error);
            res.status(500).send('Internal Server Error');
        });



}

module.exports=router;