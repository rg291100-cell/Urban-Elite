// Home Screen Services
const SERVICES_LIST = [
    { id: '1', name: 'INSTA HELP', image: 'https://cdn-icons-png.flaticon.com/512/4961/4961667.png' },
    { id: '2', name: "WOMEN'S SALON", image: 'https://cdn-icons-png.flaticon.com/512/3251/3251566.png' },
    { id: '3', name: "MEN'S SALON", image: 'https://cdn-icons-png.flaticon.com/512/3059/3059518.png' },
    { id: '4', name: 'CLEANING', image: 'https://cdn-icons-png.flaticon.com/512/2040/2040504.png' },
    { id: '5', name: 'ELECTRICIAN', image: 'https://cdn-icons-png.flaticon.com/512/2921/2921570.png' },
    { id: '6', name: 'PURIFIERS', image: 'https://cdn-icons-png.flaticon.com/512/2933/2933861.png' },
    { id: '7', name: 'PAINTING', image: 'https://cdn-icons-png.flaticon.com/512/2972/2972106.png' },
    { id: '8', name: 'AC REPAIR', image: 'https://cdn-icons-png.flaticon.com/512/2324/2324675.png' },
    { id: '9', name: 'REVAMP', image: 'https://cdn-icons-png.flaticon.com/512/5359/5359926.png' },
    { id: '10', name: 'NATIVE SMART HOME', image: 'https://cdn-icons-png.flaticon.com/512/2913/2913520.png' }
];

// Service Details Data
const SERVICE_DETAILS = {
    NativeSmartHome: {
        filters: ['ALL', 'SMART LIGHTS', 'SENSORS', 'LOCKS', 'CAMERAS'],
        services: [
            {
                title: 'Smart Lighting Setup',
                titleFull: 'Philips Hue Smart Lighting Installation & Setup',
                duration: '2 hours',
                price: '₹2,499',
                rating: '4.8',
                image: 'https://images.unsplash.com/photo-1558002038-109177381793?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
                color: '#EDF2F7',
                isImage: true
            },
            {
                title: 'Smart Security Kit',
                titleFull: 'Basic Home Security Sensor Kit Installation',
                duration: '4 hours',
                price: '₹12,999',
                rating: '4.9',
                image: 'https://images.unsplash.com/photo-1558002038-109177381793?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
                color: '#EDF2F7',
                isImage: true
            },
            {
                title: 'Smart Lock Install',
                titleFull: 'Digital Door Lock Installation (Retrofit)',
                duration: '1 hour',
                price: '₹1,500',
                rating: '4.7',
                image: 'https://images.unsplash.com/photo-1558002038-109177381793?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
                color: '#EDF2F7',
                isImage: true
            }
        ]
    },
    'InstaHelp': {
        filters: ['ALL', 'COURIER', 'BUY\nANYTHING', 'PAPERWORK'],
        services: [
            { id: '1', title: 'Send Packages', duration: 'INSTANT', price: '₹49', rating: '4.8', image: 'https://cdn-icons-png.flaticon.com/512/2946/2946802.png', color: '#F7FAFC' },
            { id: '2', title: 'Urgent Delivery', duration: '30 MINS', price: '₹99', rating: '4.9', image: 'https://cdn-icons-png.flaticon.com/512/2558/2558066.png', color: '#F7FAFC' }
        ]
    },
    'WomensSalon': {
        filters: ['ALL', 'MANICURE', 'PEDICURE', 'HAIR CUT'],
        services: [
            { id: '1', title: 'Classic Manicure', duration: '45 MINS', price: '₹499', rating: '4.8', image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', isImage: true },
            { id: '2', title: 'Spa Pedicure', duration: '60 MINS', price: '₹799', rating: '4.9', image: 'https://cdn-icons-png.flaticon.com/512/3712/3712177.png', color: '#F7FAFC' }
        ]
    },
    'MensSalon': {
        filters: ['ALL', 'HAIRCUT', 'BEARD\nGROOMING', 'MASSAGE'],
        services: [
            { id: '1', title: 'Premium Haircut', duration: '45 MINS', price: '₹299', rating: '4.8', image: 'https://images.unsplash.com/photo-1599351431202-6e000542842e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', isImage: true },
            { id: '2', title: 'Beard Trim & Style', duration: '30 MINS', price: '₹199', rating: '4.7', image: 'https://cdn-icons-png.flaticon.com/512/3845/3845862.png', color: '#F7FAFC' }
        ]
    },
    'Cleaning': {
        filters: ['ALL', 'HOME\nCLEANING', 'PEST\nCONTROL', 'KITCHEN', 'BATHROOM'],
        services: [
            { id: '1', title: 'Full Home Deep Cleaning', duration: '4-5 HOURS', price: '₹2999', rating: '4.8', image: 'https://images.unsplash.com/photo-1581578731117-920f60714c45?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', isImage: true },
            { id: '2', title: 'Cockroach & Ant Control', duration: '1 HOUR', price: '₹899', rating: '4.7', image: 'https://cdn-icons-png.flaticon.com/512/2324/2324675.png', color: '#F7FAFC' }
        ]
    },
    'Electrician': {
        filters: ['ALL', 'ELECTRICIAN', 'PLUMBER', 'CARPENTER', 'REPAIRS'],
        services: [
            { id: '1', title: 'Fan Installation', duration: '30 MINS', price: '₹149', rating: '4.8', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', isImage: true },
            { id: '2', title: 'Tap Leakage Repair', duration: '1 HOUR', price: '₹199', rating: '4.7', image: 'https://cdn-icons-png.flaticon.com/512/3079/3079106.png', color: '#F7FAFC' },
            { id: '3', title: 'Furniture Assembly', duration: '2 HOURS', price: '₹399', rating: '4.9', image: 'https://cdn-icons-png.flaticon.com/512/2603/2603741.png', color: '#F7FAFC' }
        ]
    },
    'NativeWaterPurifier': {
        filters: ['ALL', 'PURIFIER\nSERVICES', 'INSTALLATION', 'REPAIR'],
        services: [
            { id: '1', title: 'Native RO Installation', duration: '1.5 HOURS', price: '₹599', rating: '4.8', image: 'https://cdn-icons-png.flaticon.com/512/3558/3558221.png', color: '#F7FAFC' },
            { id: '2', title: 'Full Filter Change', duration: '1 HOUR', price: '₹2499', rating: '4.9', image: 'https://images.unsplash.com/photo-1542013936693-884638332954?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', isImage: true }
        ]
    },
    'Painting': {
        filters: ['ALL', 'PAINTING', 'WATERPROOFING', 'WALL\nELEVATION'],
        services: [
            { id: '1', titleFull: '1 BHK Interior Painting', title: '1 BHK Interior Paint...', duration: '3 DAYS', price: '₹12000', rating: '4.8', color: '#F7FAFC' },
            { id: '2', titleFull: 'Bathroom Waterproofing', title: 'Bathroom Waterproofi...', duration: '1 DAY', price: '₹5500', rating: '4.7', color: '#F7FAFC' }
        ]
    },
    'ACRepair': {
        filters: ['ALL', 'AC\nSERVICES', 'APPLIANCE\nREPAIR', 'GEYSER\nSERVICE'],
        services: [
            { id: '1', title: 'AC Deep Service', duration: '1 HOUR', price: '₹599', rating: '4.9', color: '#F7FAFC' },
            { id: '2', title: 'Washing Machine Repair', duration: '1 HOUR', price: '₹299', rating: '4.6', image: 'https://images.unsplash.com/photo-1626806775351-538af710f448?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', isImage: true }
        ]
    },
    'Revamp': {
        filters: ['ALL', 'WALL\nDESIGN'],
        services: [
            { id: '1', title: '3D Accent Wall', duration: '1 DAY', price: '₹8999', rating: '4.9', image: 'https://images.unsplash.com/photo-1549480017-d76466a4b7e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', isImage: true },
            { id: '2', title: 'Premium Wallpaper', duration: '4 HOURS', price: '₹2500', rating: '4.8', image: 'https://cdn-icons-png.flaticon.com/512/5650/5650567.png', color: '#F7FAFC' }
        ]
    }
};

module.exports = { SERVICES_LIST, SERVICE_DETAILS };
