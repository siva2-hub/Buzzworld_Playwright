const { userInfo } = require("os")

const testData = {
    app_url: process.env.BASE_URL_BUZZ,
    totalGP: {
        quote_id: '586d717d-a89a-49bb-a32b-f39e1aec5e55',
        is_create_new: false
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
        user_full_name: 'Default User', sys_pro_id: 'AHH', user_email: 'defaultuser@enterpi.com'
    },
    parts_buy_detls: {
        ven_part_num: 'Vendor Part||Number|| '
    },
    inventory: {
        new_part: '002-2123-01'
    },
    quotes: {
        cust_name: 'Chump Change Automation', // Chump Change Automation , Multicam Inc
        acc_num: 'CHUMP03', // CHUMP03 , MULTI00
        quote_type: 'System Quote',// System Quote , Parts Quote
        cont_name: 'chump userOne', //chump userOne --> CHUMP03, Garret Luppino --> multioo
        project_name: 'TEST_1234SS',
        stock_code: ['12342-00012', '2000-1203'],
        quote_price: '25000',
        part_desc: 'Manually Added From Quotes',
        suppl_name: 'BACO CONTROLS INC',
        suppl_code: 'BACO001',
        source_text: 'I-IDM-Stocked',
        item_notes: 'Test Item Notes 1\nTest Item Notes 2\nTest Item Notes 3\nTest Item Notes 4',
        is_create_job: true, // true, false
        quote_id: 'e2727487-5fb9-4289-ad45-2fe7604b8ad0',
        send_email_to_cust: true
    }
}
module.exports = {
    testData
}