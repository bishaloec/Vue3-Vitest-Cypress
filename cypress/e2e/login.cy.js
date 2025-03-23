// cypress/e2e/login.cy.js
describe('Login Page', () => {
    beforeEach(() => {
      // Visit the login page before each test
      cy.visit('/')
      
      // Intercept and mock API calls
      cy.intercept('POST', 'src/services/auth', (req) => {
        // Check credentials
        if (req.body.email === 'test@example.com' && req.body.password === 'Password123') {
          req.reply({
            statusCode: 200,
            body: {
              success: true,
              token: 'mock-jwt-token'
            }
          })
        } else {
          req.reply({
            statusCode: 401,
            body: {
              success: false,
              message: 'ログインメールとパスワードは一致しません'
            }
          })
        }
      }).as('loginRequest')
    })
    
    it('ログインフォームを正しくレンダリングする', () => {
      cy.get('h2').should('contain', 'ログイン「テスト」')
      cy.get('input[type="email"]').should('be.visible')
      cy.get('input[type="password"]').should('be.visible')
      cy.get('button[type="submit"]').should('be.visible').and('be.disabled')
    })
    
    it('フィールドが空のときにログインボタンを無効にする', () => {
      cy.get('button[type="submit"]').should('be.disabled')
      
      // Fill in email
      cy.get('input[type="email"]').type('test@example.com')
      cy.get('button[type="submit"]').should('be.disabled')
      
      // Fill in password
      cy.get('input[type="password"]').type('Password123')
      cy.get('button[type="submit"]').should('not.be.disabled')
    })
    
    it('メール形式を検証する', () => {
      // Type invalid email
      cy.get('input[type="email"]').type('invalid-email').blur()
      cy.get('.error-message').should('contain', '有効なメールアドレスを入力')
      
      // Type valid email
      cy.get('input[type="email"]').clear().type('test@example.com').blur()
      cy.get('.error-message').should('not.exist')
    })
    
    it('パスワード筋力警告を表示する', () => {
      const passwordInput = cy.get('input[type="password"]')
      
      // Test short password
      passwordInput.type('short').blur()
      cy.get('.warning-message').should('contain', '8文字以上の長さ')
      
      // Test password without uppercase
      passwordInput.clear().type('password123').blur()
      cy.get('.warning-message').should('contain', '1つの大文字が含まれている必要')
      
      // Test password without numbers
      passwordInput.clear().type('Password').blur()
      cy.get('.warning-message').should('contain', '1つの番号が含まれている必要')
      
      // Test strong password
      passwordInput.clear().type('Password123').blur()
      cy.get('.warning-message').should('not.exist')
    })
    
    it('成功したログインを処理する', () => {
      // Fill form with valid credentials
      cy.get('input[type="email"]').type('test@example.com')
      cy.get('input[type="password"]').type('Password123')
      
      // Submit the form
      cy.get('button[type="submit"]').click()
      
      // Check loading state
      cy.get('button[type="submit"]').should('contain', 'ログイン中')
      
      // Wait for the API call and assert success message
     // cy.wait('@loginRequest')
      //cy.get('.success-message').should('contain', 'ログインが成功')

      cy.screenshot('after-login-success');


      cy.url().should('include', '/dashboard')
      cy.contains('ようこそ、test@example.com さん！')

 
      
      
      // In a real application, we would also check for navigation or token storage
      // cy.url().should('include', '/dashboard')
    })

    it('ログアウトボタンでログイン画面に戻る', () => {
      // ログイン処理
      cy.get('input[type="email"]').type('test@example.com')
      cy.get('input[type="password"]').type('Password123')
      cy.get('button[type="submit"]').click()
      
      // ダッシュボードに遷移するのを待つ
      cy.url().should('include', '/dashboard')
      
      // ログアウトボタンをクリック
      cy.get('.logout-button').click()
      
      // ログインページに戻ることを確認
      cy.url().should('include', '/login')
      
      // メール入力フィールドが空であることを確認
      cy.get('#email').should('be.empty')
    })


    it('失敗したログインにエラーメッセージを表示する', () => {
      // Fill form with invalid credentials
      cy.get('input[type="email"]').type('wrong@example.com')
      cy.get('input[type="password"]').type('WrongPass123')
      
      // Submit the form
      cy.get('button[type="submit"]').click()
      
      // Wait for the API call and assert error message
      //cy.wait('@loginRequest')

      cy.get('.error-message').should('contain', 'ログインメールとパスワードは一致しません')

      cy.screenshot('after-login-failure');
    })
  })
  