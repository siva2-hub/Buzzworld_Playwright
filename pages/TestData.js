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
        ven_part_num: 'Vendor Part||Number|| ',
        is_from_repair: false,
        pp_item_qty: '2',
        pp_item_cost: '1234.987456',
        pp_item_desc: 'TEST DESCRIPTION',
        pp_item_spcl_notes: 'TEST ITEM SPECIAL NOTES',
        pp_item_item_notes: 'TEST ITEM NOTES'
    },
    inventory: {
        new_part: '002-2123-01'
    },
    quotes: {
        cust_name: 'Multicam Inc', // Chump Change Automation , Multicam Inc
        acc_num: 'MULTI00', // CHUMP03 , MULTI00
        quote_type: 'Parts Quote',// System Quote , Parts Quote
        cont_name: 'Garret Luppino', //chump userOne --> CHUMP03, Garret Luppino --> multioo
        project_name: 'TEST_1234SS',
        stock_code: ['EZZ022745C'], // 2000-1203, A1C4B590, 2000-1206
        quote_price: '25000',
        part_desc: 'Manually Added From Quotes',
        suppl_name: 'BACO CONTROLS INC',
        suppl_code: 'BACO001',
        source_text: 'I-IDM-Stocked',
        item_notes: 'Test Item Notes 1\nTest Item Notes 2\nTest Item Notes 3\nTest Item Notes 4',
        is_create_job: false, // true, false
        quote_id: 'e2727487-5fb9-4289-ad45-2fe7604b8ad0',
        send_email_to_cust: true
    },
    repairs: {
        cust_name: 'Multicam Inc', // Chump Change Automation , Multicam Inc, Hollymatic Corporation
        acc_num: 'MULTI00', // CHUMP03 , MULTI00 , HOLLY00
        cont_name: 'Garret Luppino', //chump userOne --> CHUMP03, Garret Luppino --> multioo
        rep_tech: 'James Nairn', //James Nairn , Dan Holmes
        rep_type: ['1'], // '1' = Repairable, '2' = Non Repairable, '3' = Outsource Repairable
        stock_code: ['05P00620-0017'], // 2000-1203, 12342-00012, 022-1BD70 , 131503.00-SURPLUS
        part_desc: 'Manually Added From Repairs',
        suppl_name: 'BACO CONTROLS INC',
        suppl_code: 'BACO001',
        serial_number: 'TEST1234SN',
        storage_loc: 'surplus', // surplus , C300
        tech_sugg_price: '800',
        item_internal_notes: 'Test Internal Notes at ',
        is_create_job: true,
        quote_type: 'Repair Quote',
        is_marked_as_in_progress: false,
        res_summary_notes: 'Test Repair Summary Notes to Customer',
        parts_notes: 'Test Parts Notes',
        qc_cmc_cust: 'Test QC Comments To Customer',
        qc_status: 'Fail', //Pass , Fail
        res_summay_data: [
            'Bench tested',
            'Installed parameters',
            'Repaired PCB'
        ],
        rep_sum_notes: 'Test Repair Summary Notes to Customer',
        intrnl_used_part_num: 'TESTPART123',
        intrnl_used_part_desc: 'Internal Used Part Description',
        apr_date_rep:'02/25/2025',
        prom_date_rep:'02/27/2025'
    }
}
module.exports = {
    testData
}