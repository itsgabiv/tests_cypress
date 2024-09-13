/// <reference types="cypress" />

const urlBase = 'https://challenge.primecontrol.com.br/'
const login = 'gabi_vee@hotmail.com'
const password = 'teste@2024'
const passworderrado = 'passworderrado@20222'
const { fakerPT_BR, faker } = require('@faker-js/faker')


//## Region login ##
function realizarlogin(login, password) {
    cy.visit(urlBase)
    cy.contains('Fazer Login').click()
    cy.get('.form-signin').should('contain.text', 'Login')
    cy.get('#floatingInput').type(login)
    cy.get('#floatingPassword').type(password)
    cy.get('.w-100').should('contain.text', 'Acessar').click()
    cy.wait(1000)
    cy.get('html').should('contain.text', 'Gestão de Clientes')
}

function logininvalido(login, passworderrado) {
    cy.visit(urlBase)
    cy.contains('Fazer Login').click()
    cy.get('#floatingInput').type(login)
    cy.get('#floatingPassword').type(passworderrado)
    cy.get('.w-100').should('contain.text', 'Acessar').click()
}


//## Region dados ##
function gerarTelefoneValido() {
    const ddd = Math.floor(11 + Math.random() * 89)
    const prefixo = Math.floor(1000 + Math.random() * 9000)
    const sufixo = Math.floor(1000 + Math.random() * 9000)
    return `${ddd}${prefixo}${sufixo}`
}

function cadastrarCliente(nome, login, cep, numero, endereco, complemento, sexo, ferramentas) {
    cy.get('.row > :nth-child(2)').contains('Cadastrar Cliente').click()
    cy.get('.col-md-9 > .form-control').type(nome).should('have.value', nome)
    cy.get('input[type=file]').selectFile('./Cypress/fixtures/upload.jpg', { force: true })
    cy.get(':nth-child(2) > .row > :nth-child(1) > .form-control').type(gerarTelefoneValido())
    cy.get(':nth-child(2) > .row > :nth-child(2) > .form-control').type(login)
    cy.get(':nth-child(3) > .row > :nth-child(1) > .form-control').type(cep)
    cy.get(':nth-child(3) > .row > :nth-child(2) > .form-control').type(numero)
    cy.get(':nth-child(4) > .row > :nth-child(1) > .form-control').type(endereco)
    cy.get(':nth-child(4) > .row > :nth-child(2) > .form-control').type(complemento)
    cy.get(':nth-child(3) > .form-control').select('Brasil')
    cy.get(`input[type="radio"][value="${sexo}"]`).check()
    ferramentas.forEach(ferramenta => {
        cy.get(`input[type="checkbox"][value="${ferramenta}"]`).check()
    })
    cy.get(':nth-child(7) > .btn').should('contain.text', 'Salvar').click()
}

function editarCliente(nomeCompleto, novoTelefone) {
    cy.wait(500)
    cy.get('tr').contains(nomeCompleto).parents('tr').find('.fas.fa-edit').click({force: true})
    cy.get(':nth-child(4) > #exampleInputEmail1').clear().type(novoTelefone)
    cy.get('.text-center').contains('Salvar').click()
}

function excluirCliente(nomeCompleto) {
    cy.get('.row > :nth-child(2)')
    cy.get('tr').contains(nomeCompleto).parents('tr').find('.far.fa-trash-alt').click({force: true})
    cy.get('.btn.btn-lg.btn-danger').click()
}

describe('Login', () => {

    it('Criar uma nova conta com sucesso', () => {
        cy.visit(urlBase)
        cy.contains('Criar uma conta').click()
        cy.get('.form-signin').should('contain.text', 'Criar Conta')
        cy.get('#floatingInput').type(fakerPT_BR.internet.email())
        cy.get('#floatingPassword').type(fakerPT_BR.internet.password())
        cy.get('.w-100').should('contain.text', 'Criar conta').click()
        cy.get('.w-100').should('contain.text', 'Acessar')
        
        cy.screenshot('cenarioCriarNovoCliente.jpg')
    })

    it('Validar criação de uma conta com e-mail já cadastrado', () => {
        cy.visit(urlBase)
        cy.contains('Criar uma conta').click()
        cy.get('.form-signin').should('contain.text', 'Criar Conta')
        cy.get('#floatingInput').type(login)
        cy.get('#floatingPassword').type(password)
        cy.get('.w-100').should('contain.text', 'Criar conta').click()
        cy.get('.form-signin').should('contain.text', 'Esse email já está em uso por outra conta')

        cy.screenshot('criarContaEmailCadastrado.jpg')
    })

    it('Realizar login com sucesso', () => {
        realizarlogin(login, password)
        cy.wait(1000)

        cy.screenshot('loginSucesso.jpg')
    })

    it('Validar login com password inválida', () => {
        logininvalido(login, passworderrado)
        cy.get('.d-flex').should('contain.text', 'E-mail ou senha inválida.')

        cy.screenshot('loginInvalido.jpg')
    })
})

describe('Cadastro e Manutenção de Cliente', () => {
    const nomeCompleto = `${fakerPT_BR.person.firstName()} ${fakerPT_BR.person.lastName()}`
    const loginFaker = fakerPT_BR.internet.email()
    const cep = fakerPT_BR.location.zipCode()
    const numeroResidencia = fakerPT_BR.location.buildingNumber()
    const endereco = fakerPT_BR.location.streetAddress()
    const complemento = fakerPT_BR.location.secondaryAddress()
    const sexo = ['masculino', 'feminino', 'outros'][Math.floor(Math.random() * 3)]
    const ferramentas = ['robot', 'selenium', 'cypress', 'appium', 'protractor'].sort(() => 0.5 - Math.random()).slice(0, 2)

    it('Realizar cadastro de cliente na aba Perfil', () => {
        realizarlogin(login, password)
        cadastrarCliente(nomeCompleto, loginFaker, cep, numeroResidencia, endereco, complemento, sexo, ferramentas)
        cy.get(':nth-child(3) > .form-control').select('Brasil')
        cy.get(':nth-child(7) > .btn').click()
        cy.wait(1500)
        cy.screenshot('cadastroAbaPerfil.jpg')
    })

    it('Realizar busca de cliente recém cadastrado', () => {
        realizarlogin(login, password)
        cy.wait(1200)
        editarCliente(nomeCompleto, gerarTelefoneValido())

        cy.screenshot('buscaClienteRescente.jpg')
    })

    it('Realizar edição do cliente recém cadastrado', () => {
        realizarlogin(login, password)
        cy.wait(1200)
        editarCliente(nomeCompleto, gerarTelefoneValido())

        cy.screenshot('editarClienteRescente.jpg')
    })

    it('Excluir cliente recém cadastrado', () => {
        realizarlogin(login, password)
        cy.wait(1200)
        excluirCliente(nomeCompleto)
        cy.get(':nth-child(9) > :nth-child(5) > [href="/app/home"] > .far').click({force: true})

        cy.screenshot('excluirClienteRescente.jpg')
    })

    it('Validar cadastro de cliente com e-mail inválido', () => {
        const escolhasexo = ['masculino', 'feminino', 'outros'][Math.floor(Math.random() * 3)]
        const escolhaferramentas = ['robot', 'selenium', 'cypress', 'appium', 'protractor'].sort(() => 0.5 - Math.random()).slice(0, 2)
        
        realizarlogin(login, password)
        cy.get('.row > :nth-child(2)').contains('Cadastrar Cliente').click()
        cy.get('input[type=file]').selectFile('./Cypress/fixtures/upload.jpg', { force: true })
        cy.get(':nth-child(2) > .row > :nth-child(1) > .form-control').type(gerarTelefoneValido())
        cy.get(':nth-child(2) > .row > :nth-child(2) > .form-control').type('naoexiste.c2')
        cy.get('.col-md-9 > .form-control').type(fakerPT_BR.person.firstName())
        cy.get(':nth-child(3) > .row > :nth-child(1) > .form-control').type(fakerPT_BR.location.zipCode())
        cy.get(':nth-child(3) > .row > :nth-child(2) > .form-control').type(fakerPT_BR.location.buildingNumber())
        cy.get(':nth-child(4) > .row > :nth-child(1) > .form-control').type(endereco)
        cy.get(':nth-child(4) > .row > :nth-child(2) > .form-control').type(complemento)
        cy.get(':nth-child(3) > .form-control').select('Brasil')
        cy.get(`input[type="radio"][value="${escolhasexo}"]`).check()
        escolhaferramentas.forEach(ferramenta => {
        cy.get(`input[type="checkbox"][value="${ferramenta}"]`).check()
        })
        cy.get('.titulo > :nth-child(2) > :nth-child(2)').contains('Salvar').click()
        cy.get('.titulo > :nth-child(2) > :nth-child(2)').should('contain.be.visible', 'Inclua um "@" no endereço de e-mail.')

        cy.screenshot('clienteEmailInvalido.jpg')
    })

    it('Validação do preenchimento de campos obrigatórios', () => {
        const escolhasexo = ['masculino', 'feminino', 'outros'][Math.floor(Math.random() * 3)]
        const escolhaferramentas = ['robot', 'selenium', 'cypress', 'appium', 'protractor'].sort(() => 0.5 - Math.random()).slice(0, 2)

        realizarlogin(login, password)
        cy.get('.row > :nth-child(2)').contains('Cadastrar Cliente').click()
        cy.get('input[type=file]').selectFile('./Cypress/fixtures/upload.jpg', { force: true })
        cy.get(':nth-child(2) > .row > :nth-child(1) > .form-control').type(gerarTelefoneValido()).should('contain.text','')
        cy.get(':nth-child(2) > .row > :nth-child(2) > .form-control').type('naoexiste.c2').should('contain.value','naoexiste.c2')
        cy.get('.col-md-9 > .form-control').type(fakerPT_BR.person.firstName()).should('contain.text','')
        cy.get(':nth-child(3) > .row > :nth-child(1) > .form-control').type(fakerPT_BR.location.zipCode()).should('contain.text','')
        cy.get(':nth-child(3) > .row > :nth-child(2) > .form-control').type(fakerPT_BR.location.buildingNumber()).should('contain.text','')
        cy.get(':nth-child(4) > .row > :nth-child(1) > .form-control').type(endereco).should('contain.text','')
        cy.get(':nth-child(4) > .row > :nth-child(2) > .form-control').type(complemento).should('contain.text','')
        cy.get(':nth-child(3) > .form-control').select('Brasil').should('contain.value','')
        cy.get(`input[type="radio"][value="${escolhasexo}"]`).check().should('be.checked')
        escolhaferramentas.forEach(ferramenta => {
        cy.get(`input[type="checkbox"][value="${ferramenta}"]`).check()})
        cy.get('input[type="checkbox"]').should('be.checked')       
            
        cy.screenshot('cadastroCamposObrigatorios.jpg')
    })
})

describe('Testes de Upload e Download', () => {
    it('Realiza validação do XML da aba "Fiscal"', () => {
        realizarlogin(login, password)
        cy.get('.nav').contains('Fiscal').click()
        cy.get('form > :nth-child(1)').contains('Baixar XML').click()
        cy.wait(500)
        cy.verifyDownload('cliente.xml')
        cy.readFile('cypress/downloads/cliente.xml').should('exist')

        cy.screenshot('uploadEDownload.jpg')
    })

    it('Importa o XLS e valida a exibição na tela', () => {
        const fileName = 'TestePrime.xls'
        realizarlogin(login, password)
        cy.get('.nav').contains('Gerenciador de Arquivos').click()
        cy.get('input[type="file"]').attachFile(fileName)
        cy.get('.modal-content').contains('Conteúdo do Arquivo Importado')
        cy.get('.close').click()
        cy.get('input[type="file"]').should('contain.value', fileName)

        cy.screenshot('XLSValido.jpg')
    })
})

describe('Testes de Cadastro do Candidato', () => {
    it('Validar o preenchimento de informações do candidato', () => {
        realizarlogin(login, password)
        cy.get('html').contains('Finalizar').click({ force: true })
        cy.get('.btn-primary-modal').click()
        cy.get('#nome').type('Gabriela Vieira')
        cy.get('#telefone').type('47996095412')
        cy.get('#githubLink').type('https://github.com/itsgabiv')
        cy.get('#nomeRecrutador').type('Kely Alves Silva Garcia')
        
        cy.screenshot('infoCandidato.jpg')

    })

    it('Realizar logout com sucesso ao clicar em "Finalizar"', () => {
        realizarlogin(login, password)
        cy.get('html').contains('Finalizar').click({ force: true })
        cy.get('.btn-danger-modal').click()
        cy.get('.form-signin').should('contain.text', 'Login')

        cy.screenshot('logoutFinalizar.jpg')
    })
})