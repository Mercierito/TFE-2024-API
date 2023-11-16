const express=require('express')
const router= express.Router()
const Joi= require('joi')
const config=require('config')
const sequelize=require('../dbConnection')
const {Bill}=require('../models/bill')
const ExcelJS=require('exceljs')

router.get('/',async(req,res)=>{
    try{
        const bills=await Bill.findAll()
        res.status(200).send(bills)
    }catch(error){
        console.log('Error :', error)
        res.status(500).send('Internal Server Error')
    }
})

/*router.get('/:id',async(req,res)=>{
    try{
        const bill=await Bill.findByPk(req.params.id)
        if(!bill){
            res.status(404).send('Bill not found')
        }else{
            res.status(200).send(bill)
        }
    }catch(error){
        console.log('Error : ',error)
        res.status(500).send('Internal Server Error')
    }
})*/

router.get('/file',(req,res)=>{
    generateExcel(res)
})


function generateExcel(res){
    var workbook=new ExcelJS.Workbook()

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

    worksheet.getCell('E7').value='Nom'
    worksheet.getCell('E7').font={
        name:'Calibri',
        size:18,
        bold:true
    }
    worksheet.mergeCells('E7:H7')

    worksheet.getCell('E9').value='rue'
    worksheet.getCell('E9').font={
        name:'Calibri',
        size:14,
        bold:true
    }
    worksheet.mergeCells('E9:H9')

    worksheet.getCell('E10').value='CP          COMMUNE'
    worksheet.getCell('E10').font={
        name:'Calibri',
        size:18,
        bold:true
    }
    worksheet.mergeCells('E10:H10')

    worksheet.getCell('E13').value='Bois de Lessines, date'
    worksheet.getCell('E13').font={
        name:'Calibri',
        size:11
    }

    worksheet.getCell('E15').value='Facture n°aa-xxx'
    worksheet.getCell('E15').font={
        name:'Calibri',
        size:11
    }

    worksheet.getCell('A17').value='Doit pour vente'
    worksheet.getCell('A17').font={
        name:'Calibri',
        size:11
    }


    

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=example.xlsx');


    workbook.xlsx.write(res).then(workbook.xlsx.writeFile('test.xlsx'))
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