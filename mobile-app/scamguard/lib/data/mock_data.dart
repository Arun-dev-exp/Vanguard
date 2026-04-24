// Mock data for the payments app.

class Contact {
  final String name;
  final String phone;
  final String initials;
  final int color; // color index

  const Contact({required this.name, required this.phone, required this.initials, required this.color});
}

class Transaction {
  final String name;
  final String upiId;
  final double amount;
  final bool isCredit;
  final String date;
  final String time;
  final String status;

  const Transaction({
    required this.name,
    required this.upiId,
    required this.amount,
    required this.isCredit,
    required this.date,
    required this.time,
    this.status = 'Completed',
  });
}

class MockData {
  static const List<Contact> recentContacts = [
    Contact(name: 'Rahul S', phone: '+91 98765 43210', initials: 'RS', color: 0),
    Contact(name: 'Priya M', phone: '+91 87654 32109', initials: 'PM', color: 1),
    Contact(name: 'Vikram K', phone: '+91 77654 32100', initials: 'VK', color: 2),
    Contact(name: 'Ananya R', phone: '+91 99887 76655', initials: 'AR', color: 3),
    Contact(name: 'Deepak J', phone: '+91 88776 55443', initials: 'DJ', color: 4),
    Contact(name: 'Sneha P', phone: '+91 66554 43322', initials: 'SP', color: 0),
  ];

  static const List<Transaction> transactions = [
    Transaction(name: 'Rahul Sharma', upiId: 'rahul@okaxis', amount: 2500, isCredit: false, date: 'Today', time: '2:15 PM'),
    Transaction(name: 'Swiggy', upiId: 'swiggy@paytm', amount: 487, isCredit: false, date: 'Today', time: '1:02 PM'),
    Transaction(name: 'Priya Menon', upiId: 'priya@ybl', amount: 5000, isCredit: true, date: 'Today', time: '11:30 AM'),
    Transaction(name: 'Electricity Bill', upiId: 'BESCOM', amount: 1840, isCredit: false, date: 'Yesterday', time: '6:45 PM'),
    Transaction(name: 'Amazon Pay', upiId: 'amazon@apl', amount: 3299, isCredit: false, date: 'Yesterday', time: '3:20 PM'),
    Transaction(name: 'Vikram Kumar', upiId: 'vikram@okicici', amount: 1000, isCredit: true, date: 'Yesterday', time: '10:15 AM'),
    Transaction(name: 'Uber', upiId: 'uber@hdfcbank', amount: 312, isCredit: false, date: 'Apr 22', time: '9:30 PM'),
    Transaction(name: 'Netflix', upiId: 'netflix@razorpay', amount: 649, isCredit: false, date: 'Apr 22', time: '12:00 PM'),
    Transaction(name: 'Deepak Jain', upiId: 'deepak@okaxis', amount: 15000, isCredit: true, date: 'Apr 21', time: '4:10 PM'),
  ];

  static const List<List<int>> avatarColors = [
    [0xFF4285F4, 0xFF1A73E8], // Blue
    [0xFF34A853, 0xFF1E8E3E], // Green
    [0xFFEA4335, 0xFFC5221F], // Red
    [0xFFFBBC05, 0xFFF9AB00], // Yellow
    [0xFF00BFA5, 0xFF009688], // Teal
  ];
}
