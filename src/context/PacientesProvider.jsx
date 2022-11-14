import { createContext, useState, useEffect } from "react";
import clienteAxios from "../config/clienteAxios";


const PacientesContext = createContext();

const PacientesProvider = ({children}) => {

    const [pacientes, setPacientes] = useState([]);
    const [paciente, setPaciente] = useState({});

    const [alerta, setAlerta] = useState({});

    useEffect(() => {
        const obtenerPacientes = async () => {
            try {
                const token = localStorage.getItem("token");
                if(!token) return
                
                const config = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                }

                const { data } = await clienteAxios("/pacientes", config)
                setPacientes(data); 

            } catch (error) {
                console.log(error);
            }
        }
        obtenerPacientes();
    },[])

    const toastMixin = Swal.mixin({
        toast: true,
        icon: 'success',
        title: 'Titulo',
        animation: false,
        position: 'top-right',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    });

    const guardarPaciente = async (paciente) => {
        
        const token = localStorage.getItem("token")
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

        if(paciente.id) {
            try {
                const { data } = await clienteAxios.put(`/pacientes/${paciente.id}`, paciente, config)
                const pacienteActualizado = pacientes.map(pacienteState => pacienteState._id === data._id ? data : pacienteState)
                setPacientes(pacienteActualizado)
            } catch (error) {
                console.log(error);
            }
        } else {
            try {
                const { data } = await clienteAxios.post("/pacientes", paciente, config)
                const { createdAt, updatedAt, __v, ...pacienteAlmacenado } = data;
    
                setPacientes([pacienteAlmacenado, ...pacientes])
                
                
            } catch (error) {
                console.log(error.response.data.msg);
            }
        }

        
    }

    const setEdicion = paciente => {
        setPaciente(paciente)
    }

    const eliminarPaciente = async id => {
        const confirmar = await Swal.fire({
            title: '¿Estas seguro de eliminar el paciente?',
            text: "!No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, eliminarlo!'
            }).then((result) => {
            if (result.isConfirmed) {
                return true;
            } else {
                return false;
            }
        })

        if(confirmar) {
            try {
                const token = localStorage.getItem("token")
                const config = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                }
                await clienteAxios.delete(`/pacientes/${id}`, config)
                const pacientesActualizado = pacientes.filter( pacientesState => pacientesState._id !== id)
                setPacientes(pacientesActualizado)
                toastMixin.fire({
                    animation: true,
                    title: 'Eliminado correctamente'
                  });
            } catch (error) {
                console.log(error);
            }
        }
    }

    return (
        <PacientesContext.Provider
            value={{
                pacientes,
                guardarPaciente,
                setEdicion,
                paciente,
                eliminarPaciente
            }}
        >
            {children}
        </PacientesContext.Provider>    
    )
}


export {
    PacientesProvider
}

export default PacientesContext;