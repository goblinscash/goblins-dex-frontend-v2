import React from 'react'
import { toast } from 'react-toastify';


const Notify = (link: string, txhash: string) => {
    let url = `${link}/${txhash}`
    toast.success(
        <div>
            Transaction completed successfully!
            <a
                href={url}
                style={{ color: 'blue', textDecoration: 'underline' }}
                target="_blank"
            >
                View Transaction
            </a>
        </div>
    );
};

export default Notify
