package platform

import (
	"crypto/rand"
	"encoding/hex"
	"time"
)

type IDGenerator struct{}

func (IDGenerator) NewID() string {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return hex.EncodeToString([]byte(time.Now().Format(time.RFC3339Nano)))
	}
	return hex.EncodeToString(bytes)
}

type Clock struct{}

func (Clock) Now() time.Time {
	return time.Now()
}
