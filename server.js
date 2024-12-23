const express = require('express');
const bodyparser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const router = express.Router(); // Thêm dòng này để tạo router mới
const app = express();
app.use(bodyparser.json());//chuyen du lieu dang json
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
//
//Liên kết đến CSDL
const db=mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    port: 3306,
    database: 'webbanhang',
});
db.connect();
//
//select (get)
app.get('/data',(req,res)=>{
    var sql="select * from khach_hang";
    db.query(sql,(err,kq)=>{
        if(err) throw err;
        console.log(kq);
        res.send(kq); //tra ve ket qua cho react-native
    });
});
//
//insert (post)
app.post('/data', (req, res) => {
    console.log(req.body);
    var data = {
        MA_CCCD: req.body.MA_CCCD,
        TEN_KH: req.body.TEN_KH,
        SDT_KH: req.body.SDT_KH,
        EMAIL_KH: req.body.EMAIL_KH,
        DIA_CHI_KH: req.body.DIA_CHI_KH,
        TEN_DN_KH: req.body.TEN_DN_KH,
        MAT_KHAU_KH: req.body.MAT_KHAU_KH
    };
    var sql = 'insert into khach_hang set ?';
    db.query(sql, data, (err, kq) => {
        if (err) throw err;
        console.log(kq);
        //tra ket qua cho react-native
        res.send({
            status: "Them thanh cong",
            MA_CCCD: req.body.MA_CCCD,
            TEN_KH: req.body.TEN_KH,
            SDT_KH: req.body.SDT_KH,
            EMAIL_KH: req.body.EMAIL_KH,
            DIA_CHI_KH: req.body.DIA_CHI_KH,
            TEN_DN_KH: req.body.TEN_DN_KH,
            MAT_KHAU_KH: req.body.MAT_KHAU_KH
        });
    });
});
//
// app.post('/login', (req, res) => {
//     const { TEN_DN_KH, MAT_KHAU_KH } = req.body;

//     const query = `SELECT * FROM khach_hang WHERE TEN_DN_KH = '${TEN_DN_KH}' AND MAT_KHAU_KH = '${MAT_KHAU_KH}'`;
//     db.query(query, (err, result) => {
//       if (err) {
//         console.error('Error executing MySQL query:', err);
//         res.status(500).json({ message: 'Internal server error' });
//         return;
//       }
//       if (result.length > 0) {
//         // Người dùng hợp lệ, trả về mã thành công
//         res.status(200).json({ message: 'Login successful' });
//       } else {
//         // Sai tên đăng nhập hoặc mật khẩu, trả về mã lỗi
//         res.status(401).json({ message: 'Invalid username or password' });
//       }
//     });
//   });
//
// app.post('/login', (req, res) => {
//   const { TEN_DN_KH, MAT_KHAU_KH } = req.body;

//   const query = `SELECT MA_CCCD FROM khach_hang WHERE TEN_DN_KH = ? AND MAT_KHAU_KH = ?`;
//   db.query(query, [TEN_DN_KH, MAT_KHAU_KH], (err, result) => {
//       if (err) {
//           console.error('Error executing MySQL query:', err);
//           res.status(500).json({ message: 'Internal server error' });
//           return;
//       }

//       if (result.length > 0) {
//           // Người dùng hợp lệ, trả về dữ liệu MA_CCCD
//           const MA_CCCD = result[0].MA_CCCD;
//           res.status(200).json({ MA_CCCD: MA_CCCD });
//       } else {
//           // Sai tên đăng nhập hoặc mật khẩu, trả về mã lỗi
//           res.status(401).json({ message: 'Invalid username or password' });
//       }
//   });
// });
app.post('/login', (req, res) => {
  const { TEN_DN_KH, MAT_KHAU_KH } = req.body;

  const query = `SELECT MA_CCCD, TEN_KH, SDT_KH, EMAIL_KH, DIA_CHI_KH FROM khach_hang WHERE TEN_DN_KH = ? AND MAT_KHAU_KH = ?`;
  db.query(query, [TEN_DN_KH, MAT_KHAU_KH], (err, result) => {
      if (err) {
          console.error('Error executing MySQL query:', err);
          res.status(500).json({ message: 'Internal server error' });
          return;
      }

      if (result.length > 0) {
          // Người dùng hợp lệ, trả về dữ liệu MA_CCCD, TEN_KH, SDT_KH, EMAIL_KH, DIA_CHI_KH
          const { MA_CCCD, TEN_KH, SDT_KH, EMAIL_KH, DIA_CHI_KH } = result[0];
          res.status(200).json({ MA_CCCD, TEN_KH, SDT_KH, EMAIL_KH, DIA_CHI_KH });
      } else {
          // Sai tên đăng nhập hoặc mật khẩu, trả về mã lỗi
          res.status(401).json({ message: 'Invalid username or password' });
      }
  });
});

//
app.get('/products', (req, res) => {
  const sql = 'SELECT * FROM san_pham';
  db.query(sql, (error, results) => {
      if (error) {
          console.error('Error querying database:', error);
          res.status(500).json({ error: 'Internal server error' });
          return;
      }
      res.json(results);
  });
});

//Lay sản phẩm bán chạy
app.get('/suggest', (req, res) => {
  const sql = 'SELECT * FROM san_pham ORDER BY SO_LUONG ASC LIMIT 10'; // ASC để sắp xếp theo thứ tự tăng dần, DESC để sắp xếp theo thứ tự giảm dần
  db.query(sql, (error, results) => {
      if (error) {
          console.error('Error querying database:', error);
          res.status(500).json({ error: 'Internal server error' });
          return;
      }
      res.json(results);
  });
});

// Lấy sản phẩm loại: máy massage
app.get('/massage', (req, res) => {
  const sql = `SELECT * FROM san_pham WHERE MA_LOAI = 1`;
  db.query(sql, (error, results) => {
      if (error) {
          console.error('Error querying database:', error);
          res.status(500).json({ error: 'Internal server error' });
          return;
      }
      res.json(results);
  });
});

// Endpoint để tìm kiếm sản phẩm
app.post('/search', (req, res) => {
  const { keyword } = req.body;
  const query = `SELECT * FROM san_pham WHERE TEN_SP LIKE '%${keyword}%'`;

  db.query(query, (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    res.json(results);
  });
});

app.get('/products/:MA_SP', (req, res) => {
  const productId = req.params.id;

  // Truy vấn cơ sở dữ liệu để lấy thông tin sản phẩm, bao gồm URL hình ảnh
  const query = `SELECT * FROM san_pham WHERE MA_SP = ${productId}`;

  connection.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    } else {
      if (results.length > 0) {
        const product = results[0];
        res.json(product);
      } else {
        res.sendStatus(404);
      }
    }
  });
});
//
// Endpoint để lưu dữ liệu vào hai bảng hoa_don và chi_tiet_hd
app.post('/order', async (req, res) => {
  try {
    // Tạo số ngẫu nhiên cho MA_HD
    const MA_HD = Math.floor(1000 + Math.random() * 9000);

    const { MA_CCCD, TEN_KH, SDT_KH, EMAIL_KH, DIA_CHI_KH, selectedProducts } = req.body;

    // Tính tổng số tiền thanh toán
    let totalPayment = 0;
    selectedProducts.forEach((product) => {
        totalPayment += product.GIA_BAN * product.quantity;
    });

    // Thêm dữ liệu vào bảng hoa_don
    const insertOrderQuery = `INSERT INTO hoa_don (MA_CCCD, MA_HD, THANH_TIEN, TRANG_THAI_HD, TEN_KH, SDT_KH, EMAIL_KH, DIA_CHI_KH, NGAY_LAP) 
                              VALUES (?, ?, ?, 'Đang xử lý', ?, ?, ?, ?, NOW())`;

    await db.query(insertOrderQuery, [MA_CCCD, MA_HD, totalPayment, TEN_KH, SDT_KH, EMAIL_KH, DIA_CHI_KH]);

    // Thêm dữ liệu vào bảng chi_tiet_hd và trừ số lượng sản phẩm
    const insertDetailPromises = selectedProducts.map(async (product) => {
        const insertDetailQuery = `INSERT INTO chi_tiet_hd (MA_HD, MA_SP, SO_LUONG_MUA) VALUES (?, ?, ?)`;
        await db.query(insertDetailQuery, [MA_HD, product.MA_SP, product.quantity]);

        // Trừ số lượng sản phẩm từ bảng san_pham
        const updateProductQuery = `UPDATE san_pham SET SO_LUONG = SO_LUONG - ? WHERE MA_SP = ?`;
        await db.query(updateProductQuery, [product.quantity, product.MA_SP]);
    });

    await Promise.all(insertDetailPromises);

    // Trả về kết quả thành công
    res.status(200).json({ success: true, message: 'Đặt hàng thành công', MA_HD: MA_HD });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi đặt hàng' });
  }
});

//
// Endpoint để lưu dữ liệu vào hai bảng hoa_don và chi_tiet_hd
// app.post('/order', async (req, res) => {
//   try {
//     // Tạo số ngẫu nhiên cho MA_HD
//     const MA_HD = Math.floor(1000 + Math.random() * 9000);

//     const { MA_CCCD, TEN_KH, SDT_KH, EMAIL_KH, DIA_CHI_KH, selectedProducts } = req.body;

//     // Tính tổng số tiền thanh toán
//     let totalPayment = 0;
//     selectedProducts.forEach((product) => {
//         totalPayment += product.GIA_BAN * product.quantity;
//     });

//     // Thêm dữ liệu vào bảng hoa_don
//     const insertOrderQuery = `INSERT INTO hoa_don (MA_CCCD, MA_HD, THANH_TIEN, TRANG_THAI_HD, TEN_KH, SDT_KH, EMAIL_KH, DIA_CHI_KH, NGAY_LAP) 
//                               VALUES (?, ?, ?, 'Đang xử lý', ?, ?, ?, ?, NOW())`;

//     await db.query(insertOrderQuery, [MA_CCCD, MA_HD, totalPayment, TEN_KH, SDT_KH, EMAIL_KH, DIA_CHI_KH]);

//     // Thêm dữ liệu vào bảng chi_tiet_hd
//     const insertDetailPromises = selectedProducts.map((product) => {
//         const insertDetailQuery = `INSERT INTO chi_tiet_hd (MA_HD, MA_SP, SO_LUONG_MUA) VALUES (?, ?, ?)`;
//         return db.query(insertDetailQuery, [MA_HD, product.MA_SP, product.quantity]);
//     });

//     await Promise.all(insertDetailPromises);

//     // Trả về kết quả thành công
//     res.status(200).json({ success: true, message: 'Đặt hàng thành công', MA_HD: MA_HD });
//   } catch (error) {
//     console.error('Error placing order:', error);
//     res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi đặt hàng' });
//   }
// });
//
// Định nghĩa route API để lấy dữ liệu từ bảng hoa_don dựa trên MA_CCCD

app.post('/donhang', (req, res) => {
  const { MA_CCCD } = req.body;

  const query = `SELECT * FROM hoa_don WHERE MA_CCCD = ?`;
  db.query(query, [MA_CCCD], (err, result) => {
      if (err) {
          console.error('Error executing MySQL query:', err);
          res.status(500).json({ message: 'Internal server error' });
          return;
      }

      if (result.length > 0) {
          // Trả về danh sách các đơn hàng tương ứng với MA_CCCD
          res.status(200).json(result);
      } else {
          // Không có đơn hàng nào tương ứng với MA_CCCD
          res.status(404).json({ message: 'Không có đơn hàng nào tương ứng' });
      }
  });
});
//
// Định nghĩa route API để lấy dữ liệu từ bảng chi_tiet_hd dựa trên MA_HD
app.post('/chitiet_hd', (req, res) => {
  const { MA_HD } = req.body;

  const query = `
      SELECT chi_tiet_hd.MA_SP, chi_tiet_hd.SO_LUONG_MUA, san_pham.TEN_SP, san_pham.MO_TA_SP, san_pham.GIA_GOC, san_pham.GIA_BAN
      FROM chi_tiet_hd
      INNER JOIN san_pham ON chi_tiet_hd.MA_SP = san_pham.MA_SP
      WHERE chi_tiet_hd.MA_HD = ?
  `;
  
  db.query(query, [MA_HD], (err, result) => {
      if (err) {
          console.error('Error executing MySQL query:', err);
          res.status(500).json({ message: 'Internal server error' });
          return;
      }

      if (result.length > 0) {
          // Trả về danh sách sản phẩm trong đơn hàng tương ứng với MA_HD
          res.status(200).json(result);
      } else {
          // Không có sản phẩm trong đơn hàng tương ứng
          res.status(404).json({ message: 'Không có sản phẩm nào trong đơn hàng tương ứng' });
      }
  });
});

//
app.post('/updateCustomer', (req, res) => {
  const { MA_CCCD, TEN_KH, SDT_KH, EMAIL_KH, DIA_CHI_KH } = req.body;

  const query = `UPDATE khach_hang SET TEN_KH = ?, SDT_KH = ?, EMAIL_KH = ?, DIA_CHI_KH = ? WHERE MA_CCCD = ?`;
  db.query(query, [TEN_KH, SDT_KH, EMAIL_KH, DIA_CHI_KH, MA_CCCD], (err, result) => {
      if (err) {
          console.error('Error executing MySQL query:', err);
          res.status(500).json({ message: 'Internal server error' });
          return;
      }

      if (result.affectedRows > 0) {
          // Cập nhật thành công
          res.status(200).json({ message: 'Cập nhật thông tin thành công' });
      } else {
          // Không tìm thấy khách hàng có MA_CCCD tương ứng
          res.status(404).json({ message: 'Không tìm thấy khách hàng tương ứng' });
      }
  });
});
//

// Endpoint to get order details based on MA_HD
app.post('/thongtin_donhang', (req, res) => {
  const { MA_HD } = req.body;

  // Truy vấn cơ sở dữ liệu để lấy thông tin đơn hàng với MA_HD tương ứng
  const query = `SELECT * FROM hoa_don WHERE MA_HD = ?`;
  db.query(query, [MA_HD], (err, result) => {
      if (err) {
          console.error('Error querying database:', err);
          res.status(500).json({ error: 'Internal server error' });
          return;
      }

      if (result.length > 0) {
          // Đơn hàng được tìm thấy, trả về thông tin đơn hàng
          const donHang = result[0];
          res.status(200).json(donHang);
      } else {
          // Không tìm thấy đơn hàng tương ứng với MA_HD
          res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
      }
  });
});
//
// Định nghĩa route API để cập nhật thông tin TRANG_THAI_HD thành "Đã hủy"
app.post('/huy_don_hang', (req, res) => {
  const { MA_HD } = req.body;

  // Thực hiện truy vấn SQL để cập nhật thông tin TRANG_THAI_HD
  const sql = `UPDATE hoa_don SET TRANG_THAI_HD = 'Đã hủy' WHERE MA_HD = ?`;
  db.query(sql, [MA_HD], (err, result) => {
    if (err) {
      console.error('Error updating order status:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    console.log('Order status updated successfully');
    res.status(200).json({ message: 'Order canceled successfully' });
  });
});
//
app.get('/flash-sale-products', (req, res) => {
  const sql = 'SELECT * FROM san_pham ORDER BY SO_LUONG DESC LIMIT 5'; // Sắp xếp theo số lượng giảm dần và giới hạn kết quả là 5
  db.query(sql, (error, results, fields) => {
      if (error) {
          res.status(500).json({ error: 'Internal Server Error' });
      } else {
          res.json(results);
      }
  });
});
//
app.listen(3000,'192.168.56.1',() => {
    console.log("Server dang chay cong 3000");
});
