package com.myeca.smarttax.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import com.myeca.smarttax.domain.usecase.CalculateTdsUseCase

data class TdsUiState(
    val income: Double = 0.0,
    val incomeType: String = "interest",
    val panProvided: Boolean = true,
    val isSenior: Boolean = false,
    val form15G15H: Boolean = false,
    val tdsAmount: Double = 0.0,
    val tdsRate: Double = 0.0,
    val threshold: Double = 0.0
)

class TdsViewModel(
    private val calculateTdsUseCase: CalculateTdsUseCase = CalculateTdsUseCase()
) : ViewModel() {

    private val _state = MutableStateFlow(TdsUiState())
    val state: StateFlow<TdsUiState> = _state

    fun updateIncome(value: Double) {
        _state.value = _state.value.copy(income = value)
    }

    fun updateIncomeType(value: String) {
        _state.value = _state.value.copy(incomeType = value)
    }

    fun togglePan(value: Boolean) {
        _state.value = _state.value.copy(panProvided = value)
    }

    fun toggleSenior(value: Boolean) {
        _state.value = _state.value.copy(isSenior = value)
    }

    fun toggleForm15G15H(value: Boolean) {
        _state.value = _state.value.copy(form15G15H = value)
    }

    fun calculate() {
        viewModelScope.launch {
            val result = calculateTdsUseCase(
                income = _state.value.income,
                incomeType = _state.value.incomeType,
                panProvided = _state.value.panProvided,
                isSeniorCitizen = _state.value.isSenior,
                form15G15HSubmitted = _state.value.form15G15H
            )
            _state.value = _state.value.copy(
                tdsAmount = result.tdsAmount,
                tdsRate = result.tdsRate,
                threshold = result.threshold
            )
        }
    }
}