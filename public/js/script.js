document.addEventListener('DOMContentLoaded', () => {
    const checkmarkSVG = `<svg class="icon-check" xmlns="http://www.w.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

    document.querySelectorAll('.endpoint-header').forEach(header => {
        header.addEventListener('click', (e) => {
            const container = header.parentElement;
            const content = header.nextElementSibling;
            const wasOpen = container.classList.contains('open');

            document.querySelectorAll('.endpoint-container.open').forEach(openContainer => {
                if(openContainer !== container) {
                    openContainer.classList.remove('open');
                    openContainer.querySelector('.endpoint-details').style.maxHeight = null;
                }
            });
            
            container.classList.toggle('open');
            content.style.maxHeight = container.classList.contains('open') ? content.scrollHeight + "px" : null;

            if(!wasOpen) {
                setTimeout(() => {
                    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 300);
            }
        });
    });

    document.querySelectorAll('.endpoint-details').forEach(details => {
        details.addEventListener('input', e => {
            if (!e.target.classList.contains('query-input')) return;
            const urlInput = details.querySelector('.request-url');
            const baseUrl = urlInput.dataset.baseUrl;
            const queryInputs = details.querySelectorAll('.query-input');
            const params = new URLSearchParams();
            queryInputs.forEach(input => { if (input.value) params.append(input.dataset.param, input.value); });
            const paramString = params.toString();
            urlInput.value = paramString ? `${baseUrl}?${paramString}` : baseUrl;
        });
    });

    document.querySelectorAll('.execute-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const endpointContainer = button.closest('.endpoint-container');
            const endpointDetails = button.closest('.endpoint-details');
            const loaderWrapper = endpointDetails.querySelector('.loader-wrapper');
            const resultCode = endpointDetails.querySelector('.result-json');
            const copyBtn = endpointDetails.querySelector('.copy-result-btn');
            const queryInputs = endpointDetails.querySelectorAll('.query-input');
            const resultContainer = endpointDetails.querySelector('.result-container');
            const pathName = endpointContainer.querySelector('.endpoint-header .path').textContent;
            
            const endpointConfig = window.endpoints.find(ep => ep.name === pathName);
            if (!endpointConfig) return;

            const finalUrl = new URL(window.location.origin + endpointConfig.path);
            let allParamsFilled = true;
            queryInputs.forEach(input => {
                if (!input.value) allParamsFilled = false;
                finalUrl.searchParams.append(input.dataset.param, input.value);
            });

            if (!allParamsFilled) {
                alert('Semua parameter harus diisi!');
                return;
            }

            resultCode.textContent = '';
            resultCode.classList.remove('placeholder');
            loaderWrapper.style.display = 'flex';
            copyBtn.style.display = 'none';
            resultContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });

            try {
                const response = await fetch(finalUrl.toString());
                const data = await response.json();
                resultCode.textContent = JSON.stringify(data, null, 2);
                copyBtn.style.display = 'flex';
            } catch (error) {
                resultCode.textContent = `Error: ${error.message}`;
            } finally {
                loaderWrapper.style.display = 'none';
            }
        });
    });
    
    document.querySelectorAll('.copy-btn, .copy-result-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            if (button.classList.contains('copied')) return;
            const originalHTML = button.innerHTML;
            const textToCopy = button.classList.contains('copy-btn')
                ? e.currentTarget.closest('.input-group').querySelector('input').value
                : e.currentTarget.parentElement.querySelector('code').textContent;
            navigator.clipboard.writeText(textToCopy);
            button.classList.add('copied');
            button.innerHTML = checkmarkSVG;
            setTimeout(() => {
                button.classList.remove('copied');
                button.innerHTML = originalHTML;
            }, 1500);
        });
    });
});
