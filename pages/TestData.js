const { userInfo } = require("os")

const testData = {
    app_url: process.env.BASE_URL_BUZZ,
    totalGP: {
        quote_id: '586d717d-a89a-49bb-a32b-f39e1aec5e55'
    },
    revOldVer: {
        quote_id: '92b89a84-4058-417b-9676-e2d0c1af6494',
        isCreateNew: false, accout_num: 'ZUMMO00', contact_name: 'James K',
        quote_type: 'System Quote', items: ['01230.9-00']//01230.9-00
    },
    pro_name_send_cust: {
        isCreateNew: false, quote_id: 'f3d6f549-185a-4efe-8c6e-99bddce76175',
        accout_num: 'ZUMMO00', contact_name: 'Austin Zummo', quote_type: 'System Quote', items: ['1234-T1234']
    },
    userDetails: {
        user_full_name: 'Default User', sys_pro_id: 'AHH'
    },
    parts_buy_detls: {
        ven_part_num: 'Vendor Part||Number|| '
    },
    inventory: {
        new_part: '002-2123-01'
    },
    quotes: {
        cust_name: 'Multicam Inc',
        acc_num: 'MULTI00',
        quote_type: 'Parts Quote',
        cont_name: 'Garret Luppino',
        project_name: 'TEST_1234SS',
        stock_code: ['12342-00012'],
        suppl_name: 'BACO CONTROLS INC',
        suppl_code: 'BACO001'
    }
}
module.exports = {
    testData
}