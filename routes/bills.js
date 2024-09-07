const express=require('express')
const router= express.Router()
const fs=require('fs').promises

const ExcelJS=require('exceljs')
const{Order,User,Course,Menu,Bill}=require('../models/models')

const{format}=require('date-fns')
const auth=require('../middleware/auth')
const authMiddleware=require('../middleware/authMiddleware')

router.get('/bills',authMiddleware.auth,async(req,res)=>{
    try{
        const bills=await Bill.findAll()
        res.status(200).send(bills)
    }catch(error){
        console.log('Error :', error)
        res.status(500).send('Internal Server Error')
    }
})

router.post('/kitchen', auth, async (req, res) => {
    console.log('ENTERING');
    try {
        console.log(req.body);
        const order = await Order.findByPk(req.body.order);
        if (!order) return res.status(404).send('Order not found');

        const user = await User.findByPk(order.userId);
        if (!user) return res.status(404).send('User not found');

        // Fetch all courses to create a mapping from course ID to course name
        const courses = await Course.findAll();
        const courseMap = {};
        courses.forEach(course => {
            courseMap[course.id] = course.name; // Create a mapping from course ID to course name
        });
        console.log(courseMap);

        // Create a new Excel workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet 1');

        // Write order number, user name, and order date each in a different row
        worksheet.getCell('A1').value = `Order Number: ${order.orderNumber}`;
        worksheet.getCell('A2').value = `Client Name: ${user.name}`;
        worksheet.getCell('A3').value = `Order Date: ${order.date}`;

        // Combine order contents and count occurrences
        const concatArray = [
            ...(order.content || []),
            ...(order.contentformmenu || [])
        ];
        console.log("ORDER: ",order)
        console.log("CONCAT ARRAY: ", concatArray);

        const countMap = {};
        concatArray.forEach(value => {
            const courseName = courseMap[value] || 'Unknown Course'; // Get the course name or default to 'Unknown Course'
            countMap[courseName] = (countMap[courseName] || 0) + 1; // Count occurrences by course name
        });

        console.log(countMap);

        // Add a header for items
        worksheet.getCell('A5').value = 'Plat';
        worksheet.getCell('B5').value = 'Quantité';

        // Add each value from countMap with its quantity to Excel, starting from row 6
        let rowIndex = 6; // Starting row index after header

        for (const [itemName, quantity] of Object.entries(countMap)) {
            worksheet.getCell(`A${rowIndex}`).value = itemName;
            worksheet.getCell(`B${rowIndex}`).value = quantity;
            rowIndex++;
        }

        // Set response headers for Excel file download with dynamic filename
        const fileName = `kitchen_${order.orderNumber}.xlsx`;
        console.log(fileName);
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        // Write the workbook to the response
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.log('Error: ', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/bill',auth,(req,res)=>{
    
    generateExcel(res,req)
})
async function generateExcel(res,req){
    console.log("start generate xl")
    var workbook=new ExcelJS.Workbook() 
    console.log("after creting workbook")   
    
    const date=new Date();
    const currentYear=date.getFullYear().toString().slice(-2)
    var formatedDate=format(date,'dd/MM/yyyy')

    console.log("set date")

    var order=await Order.findOne({
        where:{
            id:req.body.orderId
        }
    })
    console.log("get order")
    var bill=await Bill.findOne({
        where:{
            orderId:req.body.orderId
        }
    })
    console.log("get bills")

    var billNumber='yy-xxx'

    if(!bill){

        var bills=await Bill.findAll()
        var lastBill=bills[bills.length-1]
        
        if(lastBill){
            var split=lastBill.billNumber.split('-')
            if(currentYear!=split[0])
            {
                billNumber=`${currentYear}-001`
            }else{
                billNumber=`${currentYear}-${String(Number(split[1]) + 1).padStart(3, '0')}`
            }
        }else{
            billNumber=`${currentYear}-001`
        }
        const newBill=await Bill.create({
            billNumber:billNumber,
            orderId:order.id,
            dateGenerated:formatedDate
        })
    }
    else{
        billNumber=bill.billNumber,
        formatedDate=bill.dateGenerated
    }

    var user = await User.findOne({
        where:{
            id: order.userId
        }
    })

    var splitAddress=user.address.split(',')

    var worksheet=workbook.addWorksheet('Sheet 1')    

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
console.log("after constant fields")
    
//fin de constante
    
    const countMap={}
    order.content.forEach((item)=>{
        countMap[item]=(countMap[item]||0)+1
    })
    
    console.log(countMap)
    
    const startRow=20;
    var i=0
    for (const [key, value] of Object.entries(countMap)) {
        
        const course = await Course.findOne({
          where: {
            id: parseInt(key)
          }
        });
      
        const currentRow = startRow + i;
      
        worksheet.getCell(`B${currentRow}`).value = course.name;
        worksheet.getCell(`B${currentRow}`).font = {
          name: 'Calibri',
          size: 11,
          bold: true,
        };
        worksheet.getCell(`F${currentRow}`).value = value;
        worksheet.getCell(`G${currentRow}`).value = course.price;
        worksheet.getCell(`H${currentRow}`).value = course.price * value;
        worksheet.getCell(`I${currentRow}`).value = 6;
        i=i+1
      }

      
      const menuMap={}
      order.menu.forEach((item)=>{
        menuMap[item]=(menuMap[item]||0)+1
      })
      for(const[key,value]of Object.entries(menuMap)){
        const menu=await Menu.findOne({
            where:{
                id:parseInt(key)
            }
        })



        const currentRow=startRow+i

        worksheet.getCell(`B${currentRow}`).value = menu.name;
        worksheet.getCell(`B${currentRow}`).font = {
          name: 'Calibri',
          size: 11,
          bold: true,
        };
        worksheet.getCell(`F${currentRow}`).value = value;
        worksheet.getCell(`G${currentRow}`).value = menu.price;
        worksheet.getCell(`H${currentRow}`).value = menu.price * value;
        worksheet.getCell(`I${currentRow}`).value = 6;
        i=i+1
      }

      worksheet.getCell(`E${startRow+i+2}`).value='Tx TVA'
      worksheet.getCell(`F${startRow+i+2}`).value='HTVA'
      worksheet.getCell(`G${startRow+i+2}`).value='TVA'
      worksheet.getCell(`H${startRow+i+2}`).value='TVAC'

      
      let sum=0

      for(let j=startRow; j<=(startRow+i);j++){
        const cellValue=worksheet.getCell(`H${j}`).value
        if(typeof cellValue==='number'){
            sum+=cellValue
        }
      }

      worksheet.getCell(`E${startRow+i+3}`).value='6%'
      worksheet.getCell(`F${startRow+i+3}`).value=(sum/1.06).toFixed(2)
      worksheet.getCell(`G${startRow+i+3}`).value=(sum-(sum/1.06)).toFixed(2)
      worksheet.getCell(`H${startRow+i+3}`).value=sum.toFixed(2)

      worksheet.getCell(`E${startRow+i+5}`).value='Total à payer'
      worksheet.getCell(`E${startRow+i+5}`).font={
        name:'Calibri',
        size:16,
        bold:true,
        underline:true
      }

      worksheet.getCell(`G${startRow+i+5}`).value=String(sum.toFixed(2))+'€'
      worksheet.getCell(`G${startRow+i+5}`).font={
        name:'Calibri',
        size:16,
        bold:true
      }

      worksheet.mergeCells(`G${startRow+i+5}:H${startRow+i+5}`)

      worksheet.getCell(`A${startRow+i+7}`).value='En votre aimable règlement, dans les quinze jours dès réception'
      worksheet.getCell(`A${startRow+i+7}`).font={
        name:'Arial',
        size:12,
        bold:true
      }


    const filename=`${billNumber} facture ${sum}.xlsx`
    //const filePath=`./factures/${filename}`

    //res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    

   /* try{
        await fs.access('./factures')
        

    }catch(error){
        await fs.mkdir('./factures')
    }*/


    try{
       /* await workbook.xlsx.writeFile(filePath);
         console.log('File written successfully');*/

         const fileContent=await workbook.xlsx.writeBuffer()
         console.log(fileContent)

    // Send the file as a response
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    // Stream the file to the response
    //const fileContent = await fs.readFile(filePath);
    res.send(fileContent);

        
        

        
    }catch(error){
        console.error('Error handling file ',error)
        res.status(500).send('Internal Server Error')
    }
}



module.exports=router;