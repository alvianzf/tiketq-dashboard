import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export const confirmDelete = async (title: string, text: string) => {
    return MySwal.fire({
        title,
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444', // red-500
        cancelButtonColor: '#3f3f46',  // zinc-700
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        background: '#18181b', // zinc-900
        color: '#ffffff',
        customClass: {
            popup: 'rounded-[2rem] border border-white/10 backdrop-blur-3xl shadow-2xl',
            title: 'text-2xl font-bold pt-4',
            htmlContainer: 'text-zinc-400',
            confirmButton: 'rounded-xl px-6 py-3 font-bold',
            cancelButton: 'rounded-xl px-6 py-3 font-bold',
        }
    });
};

export default MySwal;
