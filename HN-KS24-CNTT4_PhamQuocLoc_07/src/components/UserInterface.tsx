import { DollarSign, Edit, Trash2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface Bill {
    id: number;
    customerName: string;
    amount: number;
    isPaid: boolean;
}

export default function BillManager() {
    const [bills, setBills] = useState<Bill[]>([]);
    const [nameInput, setNameInput] = useState<string>('');
    const [amountInput, setAmountInput] = useState<string>('');
    const [paymentStatus, setPaymentStatus] = useState<boolean>(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [recordsPerPage, setRecordsPerPage] = useState<number>(3);

    useEffect(() => {
        const storedBills = localStorage.getItem('electricityBills');
        if (storedBills) {
            setBills(JSON.parse(storedBills));
        } else {
            const initialBills: Bill[] = [
                { id: 1, customerName: 'Pham Van Khoa', amount: 720000, isPaid: true },
                { id: 2, customerName: 'Nguyen Thi Lan', amount: 890000, isPaid: false },
                { id: 3, customerName: 'Ho Minh Tuan', amount: 460000, isPaid: true },
            ];
            setBills(initialBills);
            localStorage.setItem('electricityBills', JSON.stringify(initialBills));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('electricityBills', JSON.stringify(bills));
    }, [bills]);

    const handleSubmitBill = () => {
        if (!nameInput.trim() || !amountInput) {
            alert('Vui lòng nhập đầy đủ thông tin!');
            return;
        }

        const amountValue = Number(amountInput);
        if (isNaN(amountValue) || amountValue <= 0) {
            alert('Số tiền phải là số lớn hơn 0!');
            return;
        }

        const bill: Bill = {
            id: editId ?? (bills.length ? bills[bills.length - 1].id + 1 : 1),
            customerName: nameInput.trim(),
            amount: amountValue,
            isPaid: paymentStatus,
        };

        if (editId) {
            setBills(bills.map(b => (b.id === editId ? bill : b)));
            setEditId(null);
        } else {
            setBills([...bills, bill]);
        }

        setNameInput('');
        setAmountInput('');
        setPaymentStatus(false);
    };

    const handleEditBill = (bill: Bill) => {
        setNameInput(bill.customerName);
        setAmountInput(bill.amount.toString());
        setPaymentStatus(bill.isPaid);
        setEditId(bill.id);
    };

    const handleDeleteBill = (id: number) => {
        if (window.confirm('Bạn có chắc muốn xóa hóa đơn này?')) {
            setBills(bills.filter(b => b.id !== id));
        }
    };

    const togglePaymentStatus = (id: number) => {
        setBills(bills.map(b => (b.id === id ? { ...b, isPaid: !b.isPaid } : b)));
    };

    const totalPages = Math.ceil(bills.length / recordsPerPage);
    const paginatedBills = bills.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-gray-200 p-6">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-2 mb-6">
                    <DollarSign className="text-purple-600 w-7 h-7" />
                    <h1 className="text-2xl font-bold text-gray-900">Quản Lý Hóa Đơn Điện</h1>
                </div>

                <div className="bg-white p-5 rounded-lg shadow-md mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">
                        {editId ? 'Sửa hóa đơn' : 'Tạo hóa đơn mới'}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                            type="text"
                            placeholder="Tên chủ hộ"
                            value={nameInput}
                            onChange={e => setNameInput(e.target.value)}
                            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <input
                            type="number"
                            placeholder="Số tiền (VND)"
                            value={amountInput}
                            onChange={e => setAmountInput(e.target.value)}
                            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <select
                            value={paymentStatus ? 'paid' : 'unpaid'}
                            onChange={e => setPaymentStatus(e.target.value === 'paid')}
                            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="unpaid">Chưa thanh toán</option>
                            <option value="paid">Đã thanh toán</option>
                        </select>
                    </div>
                    <button
                        onClick={handleSubmitBill}
                        className="mt-3 w-full bg-purple-600 text-white rounded-md p-2 hover:bg-purple-700 transition-colors duration-200"
                    >
                        {editId ? 'Lưu' : 'Thêm'}
                    </button>
                </div>

                <div className="bg-white p-5 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">Danh Sách Hóa Đơn</h2>
                    {paginatedBills.length === 0 ? (
                        <p className="text-gray-500 text-center py-3">Chưa có hóa đơn nào!</p>
                    ) : (
                        <div className="grid gap-3">
                            {paginatedBills.map(bill => (
                                <div
                                    key={bill.id}
                                    className="border border-gray-200 rounded-md p-3 flex justify-between items-center hover:shadow-md transition-shadow duration-200"
                                >
                                    <div>
                                        <h3 className="text-md font-medium text-purple-600">{bill.customerName}</h3>
                                        <p className="text-gray-700">{bill.amount.toLocaleString('vi-VN')} VND</p>
                                        <button
                                            onClick={() => togglePaymentStatus(bill.id)}
                                            className={`mt-1 px-2 py-1 rounded text-xs font-medium ${bill.isPaid
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-orange-100 text-orange-700'
                                                }`}
                                        >
                                            {bill.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                        </button>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditBill(bill)}
                                            className="text-purple-600 hover:text-purple-800 transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteBill(bill.id)}
                                            className="text-red-600 hover:text-red-800 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <label className="text-gray-700 text-sm">Hiển thị:</label>
                            <select
                                value={recordsPerPage}
                                onChange={e => {
                                    setRecordsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="border border-gray-300 rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value={3}>3</option>
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-300 transition-colors"
                            >
                                &lt;
                            </button>
                            <span className="px-3 py-1 bg-purple-600 text-white rounded text-sm">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-300 transition-colors"
                            >
                                &gt;
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}