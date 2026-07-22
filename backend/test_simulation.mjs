import crypto from 'crypto';

const API_URL = 'http://localhost:8080/api';

const randomString = () => crypto.randomBytes(4).toString('hex');

async function api(path, method = 'GET', body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await fetch(`${API_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
    });
    
    let text = await response.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch {
        data = text;
    }
    
    if (!response.ok) {
        throw new Error(`API Error [${method} ${path}]: ${response.status} ${response.statusText} - ${JSON.stringify(data)}`);
    }
    return data;
}

async function runSimulation() {
    console.log("🚀 Starting SafeTrade E2E Simulation...");
    const suffix = randomString();
    
    // 1. Register Users
    console.log("\n👤 Registering users...");
    const seller = await api('/users/register', 'POST', {
        username: `seller_${suffix}`, email: `seller_${suffix}@test.com`, password: 'password', firstname: 'Sam', lastname: 'Seller'
    });
    console.log(`✅ Seller registered. ID: ${seller.userId}`);

    const buyer = await api('/users/register', 'POST', {
        username: `buyer_${suffix}`, email: `buyer_${suffix}@test.com`, password: 'password', firstname: 'Bob', lastname: 'Buyer'
    });
    console.log(`✅ Buyer registered. ID: ${buyer.userId}`);

    const rider = await api('/users/register', 'POST', {
        username: `rider_${suffix}`, email: `rider_${suffix}@test.com`, password: 'password', firstname: 'Rick', lastname: 'Rider'
    });
    console.log(`✅ Rider registered. ID: ${rider.userId}`);

    // 2. Seller adds bank details
    console.log("\n🏦 Seller setting up bank details...");
    await api('/users/bank-details', 'POST', {
        name: "Sam Seller", accountNumber: "0540000000", bankCode: "MTN"
    }, seller.token);
    console.log("✅ Bank details saved successfully.");

    // 3. Buyer creates trade
    console.log("\n📦 Buyer creating trade...");
    const tradePrice = 150.0;
    const trade = await api('/trades/', 'POST', {
        title: "Test Item",
        description: "A cool test item",
        price: tradePrice,
        buyerId: buyer.userId,
        sellerId: seller.userId
    }, buyer.token);
    const tradeId = trade.id;
    console.log(`✅ Trade created. ID: ${tradeId}. Status: ${trade.status}`);

    // 4. Buyer deposits funds
    console.log("\n💳 Buyer depositing funds...");
    await api(`/trades/${tradeId}/deposit`, 'POST', null, buyer.token);
    const verifiedTrade = await api(`/trades/${tradeId}/verify-payment`, 'POST', null, buyer.token);
    console.log(`✅ Payment verified. Status: ${verifiedTrade.status}`);

    // 5. Seller uploads item photo (dispatch)
    console.log("\n📸 Seller verifying item to dispatch...");
    const dispatchTrade = await api(`/trades/${tradeId}/seller-upload`, 'POST', {
        itemPhotoBase64: "data:image/png;base64,mock..."
    }, seller.token);
    const dispatchCode = dispatchTrade.dispatchCode;
    console.log(`✅ Seller uploaded photo. Dispatch Code: ${dispatchCode}. Status: ${dispatchTrade.status}`);

    // 6. Rider picks up
    console.log("\n🛵 Rider picking up the item...");
    const transitTrade = await api(`/trades/${tradeId}/rider-pickup`, 'POST', {
        riderId: rider.userId,
        dispatchCode: dispatchCode
    }, rider.token);
    const dropOffCode = transitTrade.dropOffCode;
    console.log(`✅ Rider picked up. DropOff Code: ${dropOffCode}. Status: ${transitTrade.status}`);

    // 7. Buyer confirms delivery (Direct from rider to buyer)
    console.log("\n🤝 Buyer confirming delivery...");
    const releasedTrade = await api(`/trades/${tradeId}/buyer-confirm-rider`, 'POST', {
        dropOffCode: dropOffCode
    }, buyer.token);
    console.log(`✅ Delivery confirmed. Status: ${releasedTrade.status}`);

    // 8. Verify Seller's Balance
    console.log("\n💰 Verifying Seller Balance...");
    const loginSeller = await api('/users/login', 'POST', {
        username: `seller_${suffix}`, password: 'password'
    });
    
    if (loginSeller.user.balance >= tradePrice) {
        console.log(`🎉 SUCCESS! Seller balance is ${loginSeller.user.balance}. Escrow payout worked!`);
    } else {
        console.error(`❌ FAILURE: Seller balance is ${loginSeller.user.balance}, expected at least ${tradePrice}.`);
        process.exit(1);
    }
    
    console.log("\n✨ Simulation finished successfully!");
}

runSimulation().catch(console.error);
