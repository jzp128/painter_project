# Online Painting Application REST API Documentation

### POST

- description: create a new user (Sign Up)
- request: `POST '/signup/'
    - content-type: `application/json`
    - body: object
        - username: (string) username of the account
        - password: (string) password of the account
        - email: (string) email of the user
        
- response: 200
    - body: success
    
- response: 409
    - body: object
        - errors:
            - msg: error message (invalid value etc.)
            - param: parameter has error (email etc.)
            - location: where is the parameter (body etc.)
    - body: username / email already exists
    
- response: 500
    - internal server error 
        
```
curl  -X POST -d "username=someone&email=zkec92@gmail.com&password=aaa" http://localhost:5000/signup/
```

- description: Sign in
- request: `POST '/signin/'
    - content-type: `application/json`
    - body: object
        - email: (string) email of the account
        - password: (string) password of the account
    - cookie: txt file
    
- response: 200
    - body: user kkingmessi596@redviet.com signed in
    
- response: 401
    - body: no user with input email, access denied
    - body: incorrect password, access denied
    
``` 
$ -X POST -d "email=kkingmessi596@redviet.com&password=aaa" http://localhost:5000/signin/
```

- description: add new drawing to database
- request: `POST '/api/drawing/newDrawing/'
    - cookie: txt file
    - body: object
       - title: title of the canvas
       - width: width of the canvas
       - height: height of the canvas
       
-response: 200
    - content-type: `application/json`
    - body: id of the new canvas
    
- response: 401
    - content-type: `application/json`
    - body: access denied (user did not sign in)
  
```
$ curl -X POST 
        -d '{"title": sometitle, "width": 500, "height": 500}'
        -b cookie.txt 
        -c cookie.txt 
        http://localhost:5000/api/canvas/sharedrawing/
```

- description: share the canvas
- request: `POST '/api/canvas/sharedrawing'
    - cookie: txt file
    - body: object
       - id: the id of the canvas

- response: 200
    - content-type: `application/json`
    - body: object
        - id: to access the canvas
        - status: Successful
        
- response: 401
    - content-type: `application/json`
    - body: access denied (user is not the owner of the canvas)

- response: 404
    - content-type: `application/json`
    - body: canvas do not exist
    
- response: 500
    - internal serval error
```
$ curl -d '{"id":jed5672jd90xg4awo789}'
       -b cookie.txt 
       -c cookie.txt 
       http://localhost:5000/api/canvas/sharedrawing
```

- description: upload a new image
- request: `POST /api/images/`
    - content-type: `application/json`
    - body: object
        - id: image Id
        - fileId: The file uses this image
        - picture: (string) the upload image (file metadata)
        - content_type: the type of the image

- response: 200
    - content-type: `application/json`
    - body: object
        - file: (string) the upload image (file metadata)
      
``` 
$ curl -X POST 
       -H "Content-Type: `application/json`" 
       -d '{"_id": jed5672jd90xg4awo789, "fileId": jed5312jd90xg7awo365, "picture": req.file, "content_type": req.file.mimetype}'
       -F 'file: data=@path/to/local/file'
       http://localhost:5000/api/images/'
```
 
### GET

- description: verify the user
- request: `GET /verify/:verifyId`
- response: 200
    - content-type: `application/json`
    - body: object
        - status: 'success'
    - body: object
        - status: 'already-verified`
      
 - response: 401
    - content-type: `application/json`
    - body: object
        - status: 'user-notfound'
      
 - response: 500
    - content-type: `application/json`
    - body: Internal Server Error

```
$ curl http://localhost:5000/verify/jed5672jd90xg4awo789'
```

- description: Get all the stored canvas
- request: `GET /api/user/getDrawingList/`
    - cookie: txt file
- response: 200
    - content-type: `application/json`
    - body: array of object
        - id: fileId
        - title: title
        - isShared: is the canvas shared (true or false)
        
- response: 401
    - body: access denied (Has not signed in)
    
- response: 404
    - body: USER NOT FOUND
    
- response: 500
    - internal server error

```
$ curl -b cookie.txt -c cookie.txt http://localhost:5000/api/user/getDrawingList/
```

- description: Check if the user is authorized
- request: `GET /user/isAuth`
    - cookie: txt file
    
- response: 200
    - content-type: `application/json`
    - body: object
        - status: true
        
- response: 401
    - content-type: `application/json`
    - body: object
        - status: false
        
- response: 500
    - internal server error

``` 
$ curl -b cookie.txt -c cookie.txt http://localhost:5000/user/isAuth
```

- description: Sign out
- request: `GET '/signout/'
    - cookie: txt file
    
- response: 200
    - body: signed out

``` 
$ curl -b cookie.txt -c cookie.txt http://localhost:5000/signout/
```

- description: get the canvas with given Id
- request: `GET '/api/canvas/:canvasId'
    - cookie: txt file
    
- response: 200
    - content-type: `application/json`
    - body: object
        - id: fileId
        - title: title
        - backGoundId: null or backgroundId (to get the image of the background if exist)
        - height: height
        - width: width
        - drawables: drawables (shapes)
        - images: images (imported images)
- response: 401
    - content-type: `application/json`
    - body: object
        - err: YOU MUST BE SIGNED IN
    - body: object
        - err: You are not authorized to edit this drawing (the canvas is not shared)
```
$ curl -b cookie.txt -c cookie.txt http://localhost:5000/api/canvas/jed5672jd90xg4awo789/
```

- description: get the image
- request: `GET /api/images/:fileId/:imageId/uploaded`
      
- response: 200
    - content-type: `application/json`
    - file: MIME types

- response: 401
    - body: access denied (not signed in)
``` 
$ curl -b cookie.txt -c cookie.txt http://localhost:5000/api/images/jed5312jd90xg7awo365/jed5672jd90xg4awo789/uploaded
```
