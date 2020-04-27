var express = require('express');
var router = express.Router();
const { getList, getDetail, newBlog, updateBlog, delBlog } = require('../controller/blog')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const loginCheck = require('../middleware/loginCheck')

router.get('/list', function (req, res, next) {
  // 用户传递过来的数据都在query当中，所以可以直接从query当中取数据
  let author = req.query.author || ''
  let keyword = req.query.keyword || ''

  if (req.query.isadmin) {
    console.log('is admin')
    // 管理员界面
    console.log(req.session.username)
    if (req.session.username === null || req.session.username === undefined) {
      console.error('is admin,but no login')
      // 未登录
      res.json(
        new ErrorModel('未登录')
      )
      return
    }
    console.log('已登录 ，3333')
    // 强制管理自己的博客
    author = req.session.username
  }

  let result = getList(author, keyword)
  return result.then(listData => {
    res.json(
      new SuccessModel(listData)
    )
  })
});

router.get('/detail', (req, res, next) => {
  let detailResult = getDetail(req.query.id)

  return detailResult.then(detailData => {
    res.json(
      new SuccessModel(detailData)
    )
  })
})

router.post('/new', loginCheck, (req, res, next) => {

  // 接收一下博客的内容
  req.body.author = req.session.username // 假数据，因为没有开发登录，所以此时先设置为假数据
  let newBlogResult = newBlog(req.body)
  return newBlogResult.then(data => {
    res.json(
      new SuccessModel(data)
    )
  })
})

router.post('/update', loginCheck, (req, res, next) => {
  let updateResult = updateBlog(req.query.id, req.body)

  return updateResult.then(val => {
    if (val) {
      res.json(
        new SuccessModel()
      )
    } else {
      res.json(
        new ErrorModel('更新博客失败')
      )
    }
  })
})

router.post('/del', loginCheck, (req, res, next) => {
  let author = req.session.username 
  let result = delBlog(req.query.id, author)
  return result.then(val => {
    if (val) {
      res.json(
        new SuccessModel()
      )
    } else {
      res.json(
        new ErrorModel('删除博客失败')
      )
    }
  })
})
module.exports = router;
