const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

function Validator(options) {

    function getParent(element, selector) {
        while(element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }
    //Khai báo một Object chứa các rule của các field
    var ruleStored = {}

    function validate(inputElement,rule) {
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorMesageSelector)
        var errorMessage 
        var rules = ruleStored[rule.selector] //Khai báo biến là mảng chứa các rule của inputElement
                    //Lặp qua từng rule và gọi rule đầu tiên hoạt động
                    for (var i=0;i<rules.length;++i) {
                        switch(inputElement.type){
                            case 'radio': 
                            case 'checkbox':
                                errorMessage = rules[i](
                                    formElement.querySelector(rule.selector + ':checked')
                                )
                                break;
                            default:
                                errorMessage = rules[i](inputElement.value)
                        }
                        if (errorMessage)
                        break;
                        
                    }
                    if (errorMessage) {
                        errorElement.innerText = errorMessage
                        getParent(inputElement, options.formGroupSelector).classList.add('invalid')
                    }
                    else {
                        errorElement.innerText = ''
                        getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                    }
        return !errorMessage 
    }
    const formElement = $(options.form)
    if (formElement){

        formElement.onsubmit = function(e) {
            var isFormValid = true
            e.preventDefault()
            options.rules.forEach(function(rule){
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = validate(inputElement,rule)
                if (!isValid){
                    isFormValid = false
                }
            })
            if (isFormValid) {
                if (typeof options.onSubmit == 'function'){
                    var enableInputs = formElement.querySelectorAll('[name]')
                    var formValue = Array.from(enableInputs).reduce(function(value,input){
                        if(input.type == 'radio'){
                            value[input.name] = formElement.querySelector('input[name ="' + input.name + '"]:checked').id
                        }
                        else {
                            (value[input.name] = input.value)
                        }
                        return value
                    },{})
                    options.onSubmit(formValue)
                }
            }
            else {
                
            }
        }
        //Lặp qua từng field và tiến hành kiếm tra rule
        options.rules.forEach(function(rule,index) {
            //Nếu như key dùng để chứa rule của Object đã khai báo ở trên chưa có phần tử nào, tiến hành thêm rule vào mảng đó, cài đặt key đó là mảng
            if (!Array.isArray(ruleStored[rule.selector])){
                ruleStored[rule.selector] = [rule.test]
            }
            //Nếu key đã là mảng, tức là có ít nhất 1 rule rồi, thì tiến hành push thêm rule mới vào nếu có
            else {
                ruleStored[rule.selector].push(rule.test)
            }
            var inputElements = formElement.querySelectorAll(rule.selector)
            var inputElement = formElement.querySelector(rule.selector)
            Array.from(inputElements).forEach(function(inputElement,index){
                if(inputElement) {
                    // Xử lý trường hợp bỏ nhập
                    inputElement.onblur = function() {
                        validate(inputElement,rule)
                    }
    
                    //Xử lý khi người dùng tiến hành nhập mới
                    inputElement.oninput = function() {
                        errorElement.innerText = ''
                        getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                    }
    
                }
            })
            var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorMesageSelector)
            
        })
    }
}   

// Define rules
// Rule:
// 1. Khi có lỗi: Xuất hiện thông báo lỗi
// 2. Khi hợp lệ: Trả về undefine
Validator.isRequired = function(selector) {
    return {
            selector: selector,
            test: function(value) {
                return value ? undefined : 'Vui lòng nhập trường này'
        }
    }
}

Validator.isEmail = function(selector) {
    return {
        selector: selector,
        test: function(value) {
            var regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
            return regex.test(value) ? undefined : 'Vui lòng nhập Email hợp lệ'
        }
    }
}

Validator.minLength = function(selector,min) {
    return {
        selector: selector,
        test: function(value) {
            return value.length < min ? 'Mật khẩu cần có ít nhất 6 kí tự' : undefined 
        }
    }
}

Validator.isConfirmed = function(selector,getConfirmValue,text) {
    return {
        selector: selector,
        test: function(value) {
            return value == getConfirmValue() ? undefined : text ? `${text} không khớp` : 'Giá trị đã nhập không khớp'
        }
    }
}