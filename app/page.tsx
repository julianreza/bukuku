"use client"

import Header from '@/components/Header';
import { BinerString } from '@/utils/biner-string';
import { convertToSimpleDate } from '@/utils/date';
import FizzBuzz from '@/utils/fizz-buzz';
import SplitArray from '@/utils/split-array';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';
import { useEffect, useState } from 'react';


type Data = {
    id: string
    created_at: string
    description: string
    amount: number
    balance: number
}

const Transaction: React.FC = () => {
    const supabase = createClient();
    const [data, setData] = useState<Data[]>([])
    const [description, setDescription] = useState<string>("")
    const [amount, setAmount] = useState<number>(0)
    const [balance, setBalance] = useState<number>(0)
    const [date, setDate] = useState<string>()
    const [isEdit, setIsEdit] = useState<boolean>(false)
    const [idData, setIdData] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)

    // fizzbuzz
    const [fizzBuzz, setFizzBuzz] = useState<number>(0)
    const [resultFizzBuzz, setResultFizzBuzz] = useState<string>('')

    // biner  string
    const [binerString, setBinerString] = useState<string>('')
    const [mBinerString, setMbinerString] = useState<number>(0)
    const [nBinerString, setNbinerString] = useState<number>(0)
    const [resultBinerString, setResultBinerString] = useState<string>('')

    // split array
    const [splitArray, setSplitArray] = useState<string>('')
    const [kSplitArray, setKsplitArray] = useState<number>(0)
    const [resultSplitArray, setResultSplitArray] = useState<number>(0)

    const Loader = () => {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-5">
                <div className="w-16 h-16 border-2 border-t-8 border-gray-500 rounded-full animate-spin"></div>
            </div>
        )
    }

    const getData = async () => {
        setIsLoading(true)
        const { data } = await supabase
            .from("transactions")
            .select()
            .order('created_at', { ascending: true });
        if (data) setData(data)
    }

    const getBalance = async () => {
        setIsLoading(true)
        const { data: latestTransaction, error } = await supabase
            .from('transactions')
            .select('balance')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            throw new Error('Failed to fetch latest transaction: ' + error.message);
        }

        if (latestTransaction) setBalance(latestTransaction.balance)
    }

    useEffect(() => {
        getData()
        getBalance()
        setIsLoading(false)
    }, [])


    const checkBalance = async (amount: number) => {
        const { data: latestTransaction, error } = await supabase
            .from('transactions')
            .select('balance')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            throw new Error('Failed to fetch latest transaction: ' + error.message);
        }

        const newBalance = (latestTransaction?.balance || 0) + amount;

        if (newBalance < 0) {
            throw new Error('Balance cannot be negative');
        }
    }

    const addTransaction = async (description: string, amount: number) => {
        await checkBalance(amount)

        if (isEdit) {
            const { data: dataOld, error: errorDataOld } = await supabase
                .from('transactions')
                .select('amount')
                .eq('id', idData)
                .single()

            if (errorDataOld) {
                throw new Error('Failed to add transaction: ' + errorDataOld.message);
            }

            const { error: updateError } = await supabase
                .from('transactions')
                .update({ 'description': description, amount: amount })
                .eq('id', idData);

            if (updateError) {
                throw new Error('Failed to add transaction: ' + updateError.message);
            }

            const { error: errorUpdateBalance } = await supabase
                .rpc('update_balance', {
                    "var_amount": amount - dataOld?.amount,
                    "var_created_at": date
                })

            if (errorUpdateBalance) {
                throw new Error('Failed to add transaction: ' + errorUpdateBalance.message);
            }
        } else {
            const { error: insertError } = await supabase
                .from('transactions')
                .insert([{ description, amount, balance: balance + amount }]);

            if (insertError) {
                throw new Error('Failed to add transaction: ' + insertError.message);
            }
        }

        getData()
        getBalance()
    };


    const handleSubmit = async () => {
        setIsLoading(true)
        if (amount === undefined) return;
        try {
            await addTransaction(description, amount);
        } catch (error) {
            console.log(error);
        }
        setIsLoading(false)
    };

    const handleEdit = async (id: string) => {
        setIsLoading(true)
        const { data: dataEdit } = await supabase
            .from("transactions")
            .select()
            .eq('id', id)
            .single();

        setIsEdit(true)
        setDescription(dataEdit.description)
        setAmount(dataEdit.amount)
        setDate(dataEdit.created_at)
        setIdData(id)
        setIsLoading(false)
    }

    const handleCancel = async () => {
        setIsEdit(false)
        setDescription('')
        setAmount(0)
    }

    const handleDelete = async (id: string, amount: number, date: string) => {
        setIsLoading(true)
        if (!id) return

        await checkBalance(-amount)

        const { error: deleteError, data: dataDelete } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id)

        if (deleteError) {
            throw new Error('Failed to add transaction: ' + deleteError.message);
        }

        const { error: errorUpdateBalance } = await supabase
            .rpc('update_balance', {
                "var_amount": -amount,
                "var_created_at": date
            })

        if (errorUpdateBalance) {
            throw new Error('Failed to add transaction: ' + errorUpdateBalance.message);
        }

        getData()
        getBalance()
        setIsLoading(false)
    }

    const handleFizzBuzz = () => {
        const result = FizzBuzz(fizzBuzz)
        setResultFizzBuzz(result)
    }

    const handleBinerString = () => {
        const newBinerString = binerString.split(',')
        const result = BinerString(newBinerString, mBinerString, nBinerString)
        setResultBinerString(result.toString())
    }

    const handleSplitArray = () => {
        const newBinerString = splitArray.split(',').map(function (item) {
            return parseInt(item)
        })
        const result = SplitArray(newBinerString, kSplitArray)
        setResultSplitArray(result)
    }

    return (
        <div className='w-full flex flex-col'>
            <Header />
            {isLoading && <Loader />}
            <div className='flex flex-col px-10 gap-5 w-full text-white mb-20'>
                <h1 className='text-gray-500 text-3xl text-center'>Skill</h1>
                <div className="flex flex-col bg-gray-500 p-10 rounded-2xl shadow-2xl gap-6">
                    <span>Berikan skala (1-10) untuk skill Anda di bawah ini :</span>
                    <table className='w-1/4'>
                        <tbody>
                            <tr>
                                <td>1. PHP</td>
                                <td>: 8,7</td>
                            </tr>
                            <tr>
                                <td>2. MySQL</td>
                                <td>: 8,8</td>
                            </tr>
                            <tr>
                                <td>3. Redis</td>
                                <td>: 5</td>
                            </tr>
                            <tr>
                                <td>4. Message Broker</td>
                                <td>: 6.8</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className='flex flex-col px-10 gap-5 w-full text-white mb-20'>
                <h1 className='text-gray-500 text-3xl text-center'>Fizz Buzz</h1>
                <div className="flex flex-col bg-gray-500 p-10 rounded-2xl shadow-2xl justify-center items-center gap-4">
                    <input
                        id="fizzBuzz"
                        name="fizzBuzz"
                        type="number"
                        value={fizzBuzz}
                        onChange={(e) => setFizzBuzz(parseInt(e.target.value) || 0)}
                        className="bg-transparent text-white px-4 py-4 border border-white rounded-2xl w-1/4 " />
                    <button onClick={handleFizzBuzz} className="bg-green-300 px-10 py-3 rounded-2xl text-gray-500 text-lg">Mulai</button>
                    <span className="text-wrap mb-10">{resultFizzBuzz}</span>
                    <span className='text-2xl'>Code</span>
                    <div className='border border-white px-4 w-full  rounded-2xl'>
                        <pre className='text-wrap text-green-300'>
                            {`
export default function FizzBuzz(n: number) {
    if(n < 1) {
        return "Tidak bisa input kurang dari 1"
    }

    if(n > 10000) {
        return "Tidak bisa input lebih dari 10000"
    }

    let result = [];
    
    for (let i = 1; i <= n; i++) {
        if (i % 3 === 0 && i % 5 === 0 && i % 7 === 0) {
            result.push("FizzBuzz");
        } else if (i % 3 === 0 && i % 5 === 0) {
            result.push("Fizz1");
        } else if (i % 3 === 0 && i % 7 === 0) {
            result.push("Fizz2");
        } else if (i % 5 === 0 && i % 7 === 0) {
            result.push("Fizz3");
        } else if (i % 3 === 0) {
            result.push("Buzz1");
        } else if (i % 5 === 0) {
            result.push("Buzz2");
        } else if (i % 7 === 0) {
            result.push("Buzz3");
        } else {
            result.push(i.toString());
        }
    }

    return result.join(', ');
}
                            `}
                        </pre>
                    </div>
                </div>
            </div>

            <div className='flex flex-col px-10 gap-5 w-full text-white mb-20'>
                <h1 className='text-gray-500 text-3xl text-center'>Biner String</h1>
                <div className="w-full flex flex-col bg-gray-500 p-10 rounded-2xl shadow-2xl justify-center items-center gap-8">
                    <div className='flex flex-col gap-4 w-full'>
                        <div className='flex flex-col gap-2 items-center'>
                            <label htmlFor="binerString">Data</label>
                            <input
                                id="binerString"
                                name="binerString"
                                type="text"
                                placeholder="Masukan angka dengan pemisah ','. contoh: 10, 12, 11, 40"
                                value={binerString}
                                onChange={(e) => setBinerString(e.target.value)}
                                className="bg-transparent text-white px-4 py-4 border border-white rounded-2xl w-1/2" />
                        </div>
                        <div className='flex flex-row justify-center gap-4'>
                            <div className='flex flex-col gap-2 text-center'>
                                <label htmlFor="mBinerString">M</label>
                                <input
                                    id="mBinerString"
                                    name="mBinerString"
                                    type="text"
                                    placeholder="Masukan angka dengan pemisah ','. contoh: 10, 12, 11, 40"
                                    value={mBinerString}
                                    onChange={(e) => setMbinerString(parseInt(e.target.value) || 0)}
                                    className="bg-transparent text-white px-4 py-4 border border-white rounded-2xl" />
                            </div>
                            <div className='flex flex-col gap-2 text-center'>
                                <label htmlFor="mBinerString">N</label>
                                <input
                                    id="nBinerString"
                                    name="nBinerString"
                                    type="text"
                                    placeholder="Masukan angka dengan pemisah ','. contoh: 10, 12, 11, 40"
                                    value={nBinerString}
                                    onChange={(e) => setNbinerString(parseInt(e.target.value) || 0)}
                                    className="bg-transparent text-white px-4 py-4 border border-white rounded-2xl" />
                            </div>
                        </div>
                    </div>
                    <button onClick={handleBinerString} className="bg-green-300 px-10 py-3 rounded-2xl text-gray-500 text-lg">Mulai</button>
                    <span className="text-wrap">{resultBinerString}</span>
                    <span className='text-2xl'>Code</span>
                    <div className='border border-white px-4 w-full rounded-2xl'>
                        <pre className='text-wrap text-green-300'>
                            {`
export function BinerString(strs: string[], m: number, n: number): number {
    const dp: number[][][] = new Array(strs.length + 1);
    for (let i = 0; i <= strs.length; i++) {
        dp[i] = new Array(m + 1);
        for (let j = 0; j <= m; j++) {
            dp[i][j] = new Array(n + 1).fill(0);
        }
    }
    
    for (let i = 1; i <= strs.length; i++) {
        const zeroCount = countZeroes(strs[i - 1]);
        const oneCount = strs[i - 1].length - zeroCount;
        
        for (let j = 0; j <= m; j++) {
            for (let k = 0; k <= n; k++) {
                if (j >= zeroCount && k >= oneCount) {
                    dp[i][j][k] = Math.max(dp[i-1][j][k], dp[i-1][j-zeroCount][k-oneCount] + 1);
                } else {
                    dp[i][j][k] = dp[i-1][j][k];
                }
            }
        }
    }
    
    return dp[strs.length][m][n];
}

function countZeroes(str: string): number {
    let count = 0;
    for (let char of str) {
        if (char === '0') {
            count++;
        }
    }
    return count;
}
                            `}
                        </pre>
                    </div>
                </div>
            </div>

            <div className='flex flex-col px-10 gap-5 w-full text-white mb-20'>
                <h1 className='text-gray-500 text-3xl text-center'>Split Array</h1>
                <div className="w-full flex flex-col bg-gray-500 p-10 rounded-2xl shadow-2xl justify-center items-center gap-8">
                    <div className='flex flex-col gap-4 w-full'>
                        <div className='flex flex-col gap-2 items-center'>
                            <label htmlFor="splitArray">Data</label>
                            <input
                                id="splitArray"
                                name="splitArray"
                                type="text"
                                placeholder="Masukan angka dengan pemisah ','. contoh: 10, 12, 11, 40"
                                value={splitArray}
                                onChange={(e) => setSplitArray(e.target.value)}
                                className="bg-transparent text-white px-4 py-4 border border-white rounded-2xl w-1/2" />
                        </div>
                        <div className='flex flex-row justify-center gap-4'>
                            <div className='flex flex-col gap-2 text-center'>
                                <label htmlFor="kSplitArray">K</label>
                                <input
                                    id="kSplitArray"
                                    name="kSplitArray"
                                    type="text"
                                    placeholder="Masukan angka dengan pemisah ','. contoh: 10, 12, 11, 40"
                                    value={kSplitArray}
                                    onChange={(e) => setKsplitArray(parseInt(e.target.value) || 0)}
                                    className="bg-transparent text-white px-4 py-4 border border-white rounded-2xl" />
                            </div>
                        </div>
                    </div>
                    <button onClick={handleSplitArray} className="bg-green-300 px-10 py-3 rounded-2xl text-gray-500 text-lg">Mulai</button>
                    <span className="text-wrap">{resultSplitArray}</span>
                    <span className='text-2xl'>Code</span>
                    <div className='border border-white px-4 w-full rounded-2xl'>
                        <pre className='text-wrap text-green-300'>
                            {`
export default function SplitArray (nums: number[], k: number): number {
    function canSplit(nums: number[], k: number, maxSum: number): boolean {
        let currentSum = 0;
        let subarrays = 1;

        for (const num of nums) {
            if (currentSum + num > maxSum) {
                subarrays++;
                currentSum = num;

                if (subarrays > k) {
                    return false;
                }
            } else {
                currentSum += num;
            }
        }

        return true;
    }

    let low = Math.max(...nums);
    let high = nums.reduce((a, b) => a + b, 0);

    while (low < high) {
        const mid = Math.floor((low + high) / 2);

        if (canSplit(nums, k, mid)) {
            high = mid;
        } else {
            low = mid + 1;
        }
    }

    return low;
}
                            `}
                        </pre>
                    </div>
                </div>
            </div>

            <div className='flex flex-col px-10 gap-5 w-full text-white mb-20'>
                <h1 className='text-gray-500 text-3xl text-center'>Aplikasi Pencatatan Transaksi</h1>
                <div className='flex flex-row gap-5'>
                    <div className="flex flex-col bg-gray-500 w-1/2 p-10 rounded-2xl shadow-2xl gap-6">
                        <div className='flex flex-col gap-2'>
                            <label htmlFor="description">Deskripsi</label>
                            <input className='bg-transparent text-white px-4 py-4 border border-white rounded-2xl' id="description" type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <label htmlFor="amount">Nominal</label>
                            <input className='bg-transparent text-white px-4 py-4 border border-white rounded-2xl' id="amount" type="number" pattern="-?[0-9]+" value={amount} onChange={(e) => setAmount(parseInt(e.target.value) || 0)} />
                        </div>
                        <div className='flex flex-row gap-4'>
                            <button className='bg-green-300 px-10 py-3 rounded-2xl text-gray-500 text-lg' onClick={handleSubmit}>{isEdit ? 'Ubah' : 'Tambah'}</button>
                            {isEdit && <button className='bg-red-300 px-10 py-3 rounded-2xl text-gray-500 text-lg' onClick={handleCancel}>Batal</button>}
                        </div>
                    </div>
                    <div className='flex flex-col w-1/2 bg-gray-500 rounded-2xl shadow-2xl px-10 py-4 gap-4'>
                        <span className='text-xl'>Balance: <span className='font-bold'>{balance}</span></span>
                        <table className='text-center'>
                            <thead>
                                <tr>
                                    <th className='py-5 bg-gray-200 text-gray-500'>
                                        Tanggal Transaksi
                                    </th>
                                    <th className='py-5 bg-gray-200 text-gray-500'>
                                        Deskripsi
                                    </th>
                                    <th className='py-5 bg-gray-200 text-gray-500'>
                                        Nominal Transaksi
                                    </th>
                                    <th className='py-5 bg-gray-200 text-gray-500'>
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    data?.map((row, index) => (
                                        <tr key={index}>
                                            <td className='py-4'>{convertToSimpleDate(row.created_at)}</td>
                                            <td>{row.description}</td>
                                            <td className={row.amount < 0 ? 'text-red-300' : 'text-green-300'}>{row.amount}</td>
                                            <td>
                                                <button onClick={() => handleEdit(row.id)} className='mr-2 text-green-300'>
                                                    Ubah
                                                </button>
                                                <button onClick={() => handleDelete(row.id, row.amount, row.created_at)} className='text-red-300'>
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className='flex flex-col px-10 gap-5 w-full text-white mb-20'>
                <h1 className='text-gray-500 text-3xl text-center'>pseudocode</h1>
                <div className="bg-gray-500 p-10 rounded-2xl shadow-2xl">
                    <pre>
                        {
                            `Fungsi TambahTransaksi(deskripsi, nominal):
    Jika Balance terakhir di tambah nominal sama dengan negatif:
        Kembalikan Error
    Jika Balance terakhir di tambah nominal tidak sama dengan negatif:
        data deskripsi, nominal dan balance terbaru berhasil masuk kedalam databse, balance terbaru di dapat dari balance terakhir di tambah nominal`
                        }
                    </pre>
                </div>
                <div className="bg-gray-500 p-10 rounded-2xl shadow-2xl">
                    <pre>
                        {
                            `Fungsi UbahTransaksi(id):
    Ambil data dari database berdasarkan id:
        Masukan data Deskripsi dan nominal ke dalam form:
            Ubah sesuai dengan apa yang anda inginkan:
                Jika Balance terakhir di tambah nominal perubahan data sama dengan negatif:
                    Kembalikan Error
                Jika Balance terakhir di tambah nominal perubahan data tidak sama dengan negatif:
                    data deskripsi, nominal dan balance terbaru berhasil terubah kedalam databse, balance terbaru di dapat dari balance terakhir di tambah nominal`
                        }
                    </pre>
                </div>
                <div className="bg-gray-500 p-10 rounded-2xl shadow-2xl">
                    <pre>
                        {
                            `Fungsi HapusTransaksi(id):
    Jika Balance terakhir di kurang nominal data yang di hapus sama dengan negatif:
        Kembalikan Error
    Jika Balance terakhir di kurang nominal data yang di hapus tidak sama dengan negatif:
        Data terhapus dari database dan balance terbaru berhasil terubah, balance terbaru di dapat dari balance terakhir di kurang nominal data yang di hapus`
                        }
                    </pre>
                </div>
            </div>

            <div className='flex flex-col px-10 gap-5 w-full text-white'>
                <h1 className='text-gray-500 text-3xl text-center'>database</h1>
                <div className="flex flex-col justify-center bg-gray-500 p-10 rounded-2xl shadow-2xl">
                    <div className='flex flex-col justify-center items-center gap-2 mb-10'>
                        <span className='text-lg font-semibold'>Table Transactions</span>
                        <Image src='/images/table.png' alt="table" width={500} height={500} />
                    </div>
                    <div className='flex flex-col items-center gap-2'>
                        <span className='text-lg font-semibold'>Fungsi update balance di posgree</span>
                        <pre>
                            {`BEGIN
    update transactions
  set balance = balance + var_amount
  where created_at between var_created_at and now();
END;`}
                        </pre>
                    </div>
                    <div className='flex flex-col items-center gap-2'>
                        <span className='text-lg font-semibold'>Fungsi delete balance di posgree</span>
                        <pre>
                            {`BEGIN
    update transactions
  set balance = balance - var_amount
  where var_created_at > created_at;
END;`}
                        </pre>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Transaction