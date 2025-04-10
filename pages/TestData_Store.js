export const storeTestData = {
    storeLogin: {
        multicam: {
            email: 'multicam@testuser.com',
            pword: 'Enter@4321',
            user_name: 'test'
        },
        chump: {
            email: 'chumpchange@espi.co',
            pword: 'Enter@4321',
            user_name: 'Chump'
        },
    },
    new_cust_detls: {
        customer_name: 'Chump Change Multi4',
        f_name: 'Chump',
        l_name: 'ChangeEspi',
        email: 'chumpchangemulti@espi.co'
    },
    exist_cust_detls: {
        customer_name: 'Chump Change Automation', //Chump Change Automation , Multicam Inc
        f_name: 'Chump', // Chump , Garret
        l_name: 'Change', // Change , Luppino
        email: 'test@enspchump321.co' //test@enspchump123.co , testmulti@espi.com
    },
    price_product: '2022-109', // 0165029SS [In sys], 231-642 [In sys] , 022-1BD50 , 021-1BF01 , 050-1BA10 , 032-1BD70 , 05P00620-0017
    price_product_1: 'AF52-30-22-13', // UG39-Custom [In sys], 231-2706/026-000 [In sys],2000-1206[In sys] 2000-1406 , 053-1MT01 , 053-IP00 , 2000-2207
    non_price_product: '760916-45',
    non_price_product_1: '376834-1D',
    po_number: 'MAR-7-2025_TEST_PORTAL',
    card_details: {
        american: {
            card_number: '370000000000002',
            exp_date: '12/25',
            cvv: '1234'
        },
        visa: {
            card_number: '4111111111111111',
            exp_date: '12/25',
            cvv: '123'
        }
    },
    guest_api_path: '',
    loggedIn_api_path: 'doPayment',
    notes: 'Net 30 Payment from Store logged-In User with file attachment',
    shipping_method:'FEDX - Ground' //
}
/*
Notes:=====>
    Net 30 Payment from Store logged-In User with file attachment
    Net 30 Payment from Portal (from quote detailed view) logged-In User with file attachment
    Credit Card Payment from Portal (from quote detailed view) logged-In User
    Credit Card Payment from Store Logged-In User
    Credit Card Payment from Store as Guest ( Existing customer, New contact)
    Credit Card Payment from Store as Guest ( New customer, New contact)

*/