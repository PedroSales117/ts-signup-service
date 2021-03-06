import { Request, Response } from 'express'
import { router } from '../config/express.config'
import { Authenticator } from '../middleware/Authenticator'
import { UserMakeController } from '../controllers/userController'

export const CreateUserRouter = router

CreateUserRouter.post('/create', (request: Request, response: Response) => {
  const { email, pass, phone, address, gender, birthday } = request.body
  const requiredFields = [
    'email',
    'pass',
    'phone',
    'address',
    'gender',
    'birthday'
  ]
  for (const field of requiredFields) {
    if (!request.body[field]) {
      return response.status(400).json({
        error: `Missing field ${field}`
      })
    }
  }
  void new UserMakeController().findUser(email).then(userFind => {
    if (userFind?.email === email) {
      return response.status(400).json({
        error: 'E-mail already in use'
      })
    } else {
      const encodedPass = new Authenticator().encode(pass)
      void new UserMakeController().createUser({
        email: email,
        pass: encodedPass,
        phone: phone,
        address: address,
        gender: gender,
        birthday: birthday
      })
        .then(async dataBaseResponse => {
          try {
            if (dataBaseResponse === {}) {
              return response.status(500).json({
                ServerError: 'Error creating user, try again later.'
              })
            }
            return response.status(200).json({
              data: 'User sucessful created'
            })
          } catch (error) {
            console.log(error)
            return error
          }
        }).catch(error => {
          return response.status(500).json({
            error: error
          })
        })
    }
  })
})
